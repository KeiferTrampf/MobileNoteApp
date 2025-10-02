import * as Location from "expo-location";
import { Alert } from "react-native";
import { LocationData } from "../types";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ValidationUtils } from "../utils/validation";

export class LocationService {
  private static watchId: Location.LocationSubscription | null = null;
  private static isMonitoring = false;

  /**
   * Request location permissions
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        ErrorHandler.handle(ErrorHandler.ERRORS.LOCATION_PERMISSION_DENIED);
        return false;
      }

      // For background location (needed for geofencing)
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background Location",
          'For location-based reminders to work when the app is closed, please enable "Allow all the time" in location settings.',
          [{ text: "OK" }]
        );
        // Still return true for foreground location
      }

      return true;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }

  /**
   * Get current location
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check permissions first
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      // Try to get address
      let address: string | undefined;
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          address = [addr.streetNumber, addr.street, addr.city, addr.region]
            .filter(Boolean)
            .join(", ");
        }
      } catch (geocodeError) {
        console.log("Geocoding failed, using coordinates only");
      }

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address:
          address ||
          `${location.coords.latitude.toFixed(
            6
          )}, ${location.coords.longitude.toFixed(6)}`,
        radius: 100, // Default 100 meter radius
      };

      // Validate location data
      const validationErrors = ValidationUtils.validateLocation(locationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      return locationData;
    } catch (error) {
      console.error("Error getting current location:", error);
      ErrorHandler.handle({
        code: "LOCATION_ERROR",
        message: "Failed to get current location",
        userMessage:
          "Unable to get your location. Please check location settings and try again.",
        recoverable: true,
      });
      return null;
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Start monitoring location for geofencing
   */
  static async startLocationMonitoring(
    onLocationUpdate: (location: Location.LocationObject) => void
  ): Promise<boolean> {
    try {
      if (this.isMonitoring) {
        console.log("Location monitoring already active");
        return true;
      }

      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return false;
      }

      // Start watching location
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Check every 30 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        onLocationUpdate
      );

      this.isMonitoring = true;
      console.log("Location monitoring started");
      return true;
    } catch (error) {
      console.error("Error starting location monitoring:", error);
      return false;
    }
  }

  /**
   * Stop location monitoring
   */
  static async stopLocationMonitoring(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }
      this.isMonitoring = false;
      console.log("Location monitoring stopped");
    } catch (error) {
      console.error("Error stopping location monitoring:", error);
    }
  }

  /**
   * Check if current location is within geofence of any notes
   */
  static checkGeofences(
    currentLocation: Location.LocationObject,
    noteLocations: Array<{
      noteId: string;
      location: LocationData;
      noteTitle: string;
    }>
  ): Array<{ noteId: string; noteTitle: string; distance: number }> {
    const triggeredNotes: Array<{
      noteId: string;
      noteTitle: string;
      distance: number;
    }> = [];

    for (const noteLocation of noteLocations) {
      const distance = this.calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        noteLocation.location.latitude,
        noteLocation.location.longitude
      );

      if (distance <= noteLocation.location.radius) {
        triggeredNotes.push({
          noteId: noteLocation.noteId,
          noteTitle: noteLocation.noteTitle,
          distance: Math.round(distance),
        });
      }
    }

    return triggeredNotes;
  }

  /**
   * Format location for display
   */
  static formatLocationDisplay(location: LocationData): string {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  /**
   * Get location accuracy description
   */
  static getAccuracyDescription(accuracy: number | null): string {
    if (!accuracy) return "Unknown accuracy";

    if (accuracy <= 5) return "Very high accuracy";
    if (accuracy <= 10) return "High accuracy";
    if (accuracy <= 50) return "Good accuracy";
    if (accuracy <= 100) return "Fair accuracy";
    return "Low accuracy";
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error("Error checking location services:", error);
      return false;
    }
  }

  /**
   * Open device location settings
   */
  static async openLocationSettings(): Promise<void> {
    try {
      Alert.alert(
        "Location Settings",
        "Please enable location services in your device settings to use location-based reminders.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              // This would open settings on a real device
              console.log("Opening location settings...");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error opening location settings:", error);
    }
  }
}
