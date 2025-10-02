import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from "react-native";

interface PhotoAttachmentProps {
  imageUri: string;
  onPress: () => void;
  onDelete: () => void;
  editable: boolean;
}

export default function PhotoAttachment({
  imageUri,
  onPress,
  onDelete,
  editable,
}: PhotoAttachmentProps) {
  const handleDelete = () => {
    Alert.alert("Delete Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode='cover'
        />

        {/* Delete button - only show if editable */}
        {editable && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
});
