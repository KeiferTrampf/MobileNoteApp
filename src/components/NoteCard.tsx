import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Note } from "../types";
import { DataTransformUtils } from "../utils/dataTransform";

interface NoteCardProps {
  note: Note;
  onPress: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onEdit: (noteId: string) => void;
}

export default function NoteCard({
  note,
  onPress,
  onDelete,
  onEdit,
}: NoteCardProps) {
  const handlePress = () => {
    onPress(note.id);
  };

  const handleEdit = () => {
    onEdit(note.id);
  };

  const handleDelete = () => {
    onDelete(note.id);
  };

  const previewText = DataTransformUtils.getPreviewText(note.content, 80);
  const formattedDate = DataTransformUtils.formatDate(note.updatedAt);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={2}>
        {previewText}
      </Text>

      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          {note.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{note.category}</Text>
            </View>
          )}
          {note.tags.length > 0 && (
            <Text style={styles.tagCount}>
              {note.tags.length} tag{note.tags.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {note.photos.length > 0 && (
        <View style={styles.photoIndicator}>
          <Text style={styles.photoText}>📷 {note.photos.length}</Text>
        </View>
      )}

      {note.location && (
        <View style={styles.locationIndicator}>
          <Text style={styles.locationText}>📍 Location reminder</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#6366f1",
    borderRadius: 4,
    marginRight: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },
  tagCount: {
    fontSize: 12,
    color: "#888",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  photoIndicator: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  photoText: {
    fontSize: 12,
    color: "#666",
  },
  locationIndicator: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
});
