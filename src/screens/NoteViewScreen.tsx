import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList, Note } from "../types";
import { LocationService } from "../services/LocationService";
import { NotesService } from "../services/NotesService";
import { DataTransformUtils } from "../utils/dataTransform";
import PhotoAttachmentComponent from "../components/PhotoAttachment";

type NoteViewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NoteView"
>;
type NoteViewScreenRouteProp = RouteProp<RootStackParamList, "NoteView">;

interface Props {
  navigation: NoteViewScreenNavigationProp;
  route: NoteViewScreenRouteProp;
}

export default function NoteViewScreen({ navigation, route }: Props) {
  const { noteId } = route.params;
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load note when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNote();
    }, [noteId])
  );

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const loadedNote = await NotesService.getNoteById(noteId);
      if (loadedNote) {
        setNote(loadedNote);
      } else {
        Alert.alert("Error", "Note not found", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error loading note:", error);
      Alert.alert("Error", "Failed to load note", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate("NoteEditor", { noteId });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePhotoPress = (photoUri: string) => {
    // TODO: Implement full-screen photo viewer
    Alert.alert("Photo", "Full-screen photo viewer coming soon!");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#6366f1' />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Note not found</Text>
        <TouchableOpacity style={styles.button} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Back to Notes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{note.title}</Text>

        <View style={styles.metaInfo}>
          <Text style={styles.category}>
            Category: {note.category || "Uncategorized"}
          </Text>
          <Text style={styles.date}>
            Updated: {DataTransformUtils.formatDate(note.updatedAt)}
          </Text>
        </View>

        <View style={styles.tagsContainer}>
          {note.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.noteContent}>{note.content || "No content"}</Text>

        {/* Photos Section */}
        {note.photos && note.photos.length > 0 && (
          <View style={styles.photosContainer}>
            <Text style={styles.sectionTitle}>📷 Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosRow}>
                {note.photos.map((photo) => (
                  <PhotoAttachmentComponent
                    key={photo.id}
                    imageUri={photo.uri}
                    onPress={() => handlePhotoPress(photo.uri)}
                    onDelete={() => {}} // No delete in view mode
                    editable={false}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Location Information */}
        {note.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>📍 Location Reminder</Text>
            <Text style={styles.locationAddress}>
              {LocationService.formatLocationDisplay(note.location)}
            </Text>
            <Text style={styles.locationRadius}>
              Reminder radius: {note.location.radius} meters
            </Text>
          </View>
        )}

        <Text style={styles.info}>Note ID: {noteId}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit Note</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoBack}
          >
            <Text style={styles.secondaryButtonText}>Back to Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  category: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },
  locationContainer: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  locationRadius: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  info: {
    fontSize: 12,
    color: "#888",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6366f1",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    marginBottom: 20,
    textAlign: "center",
  },
  // Photos section
  photosContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: "row",
    paddingRight: 16,
  },
});
