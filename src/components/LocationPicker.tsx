import React from "react";
import { View, StyleSheet } from "react-native";
import { LocationData } from "../types";

interface LocationPickerProps {
  onLocationSelected: (location: LocationData) => void;
  initialLocation?: LocationData;
}

export default function LocationPicker({
  onLocationSelected,
  initialLocation,
}: LocationPickerProps) {
  return (
    <View style={styles.container}>
      {/* Location picker component will be implemented in Task 7 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Placeholder styles
  },
});
