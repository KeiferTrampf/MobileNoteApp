import * as Location from "expo-location";
import { LocationService } from "./LocationService";
import { NotesService } from "./NotesService";
import { NotificationService } from "./NotificationService";
import { Note } from "../types";

export class GeofencingService {
  private static isActive = false;
  private static checkInterval: NodeJS.Timeout | null = null;
  private static lastNotifiedNotes = new Set<string>();

  /**
   * Start geofencing monitoring
   */
  static async startGeofencing(): Promise<boolean> {
    try {
      if (this.isActive) {
        console.log("Geofencing already active");
        return true;
      }

      // Check if location services are enabled
      const isLocationEnabled = await LocationService.isLocationEnabled();
      if (!isLocationEnabled) {
        console.log("Location services not enabled");
        return false;
      }

      // Start location monitoring
      const started = await LocationService.startLocationMonitoring(
        this.handleLocationUpdate.bind(this)
      );

      if (started) {
        this.isActive = true;
        console.log("Geofencing started successfully");

        // Also set up periodic checks every 2 minutes
        this.checkInterval = setInterval(() => {
          this.checkAllGeofences();
        }, 120000); // 2 minutes
      }

      return started;
    } catch (error) {
      console.error("Error starting geofencing:", error);
      return false;
    }
  }

  /**
   * Stop geofencing monitoring
   */
  static async stopGeofencing(): Promise<void> {
    try {
      await LocationService.stopLocationMonitoring();

      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      this.isActive = false;
      this.lastNotifiedNotes.clear();
      console.log("Geofencing stopped");
    } catch (error) {
      console.error("Error stopping geofencing:", error);
    }
  }

  /**
   * Handle location updates from LocationService
   */
  private static async handleLocationUpdate(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      await this.checkGeofencesForLocation(location);
    } catch (error) {
      console.error("Error handling location update:", error);
    }
  }

  /**
   * Check geofences for a specific location
   */
  private static async checkGeofencesForLocation(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      // Get all notes with locations
      const allNotes = await NotesService.getAllNotes();
      const notesWithLocations = allNotes.filter((note) => note.location);

      if (notesWithLocations.length === 0) {
        return;
      }

      // Prepare location data for checking
      const noteLocations = notesWithLocations.map((note) => ({
        noteId: note.id,
        location: note.location!,
        noteTitle: note.title,
      }));

      // Check which geofences are triggered
      const triggeredNotes = LocationService.checkGeofences(
        location,
        noteLocations
      );

      // Handle triggered geofences
      for (const triggered of triggeredNotes) {
        await this.handleGeofenceTriggered(triggered);
      }

      // Clean up old notifications (remove notes that are no longer in range)
      const triggeredNoteIds = new Set(triggeredNotes.map((t) => t.noteId));
      for (const noteId of this.lastNotifiedNotes) {
        if (!triggeredNoteIds.has(noteId)) {
          this.lastNotifiedNotes.delete(noteId);
        }
      }
    } catch (error) {
      console.error("Error checking geofences:", error);
    }
  }

  /**
   * Handle when a geofence is triggered
   */
  private static async handleGeofenceTriggered(triggered: {
    noteId: string;
    noteTitle: string;
    distance: number;
  }): Promise<void> {
    try {
      // Avoid duplicate notifications
      if (this.lastNotifiedNotes.has(triggered.noteId)) {
        return;
      }

      // Mark as notified
      this.lastNotifiedNotes.add(triggered.noteId);

      // Send location-based notification
      const notificationId =
        await NotificationService.scheduleLocationNotification(
          triggered.noteTitle,
          triggered.noteId,
          triggered.distance
        );

      if (notificationId) {
        console.log(
          `🔔 Location notification sent for: "${triggered.noteTitle}" (${triggered.distance}m away)`
        );
      }
    } catch (error) {
      console.error("Error handling geofence trigger:", error);
    }
  }

  /**
   * Manually check all geofences (called periodically)
   */
  private static async checkAllGeofences(): Promise<void> {
    try {
      // Get current location
      const currentLocation = await LocationService.getCurrentLocation();
      if (!currentLocation) {
        return;
      }

      // Convert to Location.LocationObject format
      const locationObject: Location.LocationObject = {
        coords: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          altitude: null,
          accuracy: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      await this.checkGeofencesForLocation(locationObject);
    } catch (error) {
      console.error("Error in periodic geofence check:", error);
    }
  }

  /**
   * Get geofencing status
   */
  static getStatus(): {
    isActive: boolean;
    monitoredNotesCount: number;
    lastNotifiedCount: number;
  } {
    return {
      isActive: this.isActive,
      monitoredNotesCount: 0, // Will be updated when we have notes
      lastNotifiedCount: this.lastNotifiedNotes.size,
    };
  }

  /**
   * Reset notification history (useful for testing)
   */
  static resetNotificationHistory(): void {
    this.lastNotifiedNotes.clear();
    console.log("Geofencing notification history reset");
  }
}
