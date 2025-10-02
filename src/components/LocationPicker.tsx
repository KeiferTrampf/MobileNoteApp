import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { LocationData } from "../types";
import { LocationService } from "../services/LocationService";

interface LocationPickerProps {
  onLocationSelected: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export default function LocationPicker({
  onLocationSelected,
  initialLocation,
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    LocationData | undefined
  >(initialLocation);
  const [customRadius, setCustomRadius] = useState(
    initialLocation?.radius?.toString() || "100"
  );

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const locationWithRadius = {
          ...location,
          radius: parseInt(customRadius) || 100,
        };
        setSelectedLocation(locationWithRadius);
        onLocationSelected(locationWithRadius);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRadiusChange = (radius: string) => {
    setCustomRadius(radius);
    if (selectedLocation) {
      const updatedLocation = {
        ...selectedLocation,
        radius: parseInt(radius) || 100,
      };
      setSelectedLocation(updatedLocation);
      onLocationSelected(updatedLocation);
    }
  };

  const handleRemoveLocation = () => {
    setSelectedLocation(undefined);
    // Call with null to indicate location removal
    onLocationSelected({
      latitude: 0,
      longitude: 0,
      radius: 0,
    });
  };

  return (
    <View style={styles.container}>
      {!selectedLocation ? (
        <TouchableOpacity
          style={styles.getLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text style={styles.getLocationText}>📍 Get Current Location</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.locationInfo}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>📍 Location Reminder Set</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveLocation}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.locationAddress}>
            {LocationService.formatLocationDisplay(selectedLocation)}
          </Text>

          <View style={styles.radiusContainer}>
            <Text style={styles.radiusLabel}>Reminder radius (meters):</Text>
            <TextInput
              style={styles.radiusInput}
              value={customRadius}
              onChangeText={handleRadiusChange}
              keyboardType='numeric'
              placeholder='100'
              maxLength={4}
            />
          </View>

          <Text style={styles.helperText}>
            You'll get a reminder when you're within {customRadius || 100}{" "}
            meters of this location
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  getLocationButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  getLocationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  locationInfo: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  locationAddress: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
  },
  radiusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radiusLabel: {
    fontSize: 14,
    color: "#374151",
    marginRight: 8,
    flex: 1,
  },
  radiusInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: "#fff",
    width: 80,
    textAlign: "center",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
});
