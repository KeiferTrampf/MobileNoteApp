import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import {
  RootStackParamList,
  Note,
  PhotoAttachment,
  LocationData,
} from "../types";
import { NotesService } from "../services/NotesService";
import { ErrorHandler } from "../utils/ErrorHandler";
import { CameraService } from "../services/CameraService";
import { LocationService } from "../services/LocationService";
import { NotificationService } from "../services/NotificationService";
import { ValidationUtils } from "../utils/validation";
import PhotoAttachmentComponent from "../components/PhotoAttachment";
import LocationPicker from "../components/LocationPicker";

type NoteEditorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NoteEditor"
>;
type NoteEditorScreenRouteProp = RouteProp<RootStackParamList, "NoteEditor">;

interface Props {
  navigation: NoteEditorScreenNavigationProp;
  route: NoteEditorScreenRouteProp;
}

export default function NoteEditorScreen({ navigation, route }: Props) {
  const { noteId } = route.params || {};
  const isEditing = !!noteId;

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [location, setLocation] = useState<LocationData | undefined>(undefined);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for navigation between inputs
  const titleRef = useRef<TextInput>(null);
  const contentRef = useRef<TextInput>(null);

  // Load existing note if editing
  useEffect(() => {
    if (isEditing && noteId) {
      loadNote();
    }
  }, [noteId, isEditing]);

  const loadNote = async () => {
    if (!noteId) return;

    try {
      setIsLoading(true);
      const note = await NotesService.getNoteById(noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategory(note.category || "");
        setTags(note.tags.join(", "));
        setPhotos(note.photos || []);
        setLocation(note.location);
        setReminderDate(note.reminder?.dateTime);
      } else {
        Alert.alert("Error", "Note not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading note:", error);
      Alert.alert("Error", "Failed to load note");
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Error", "Please enter a title or content for your note");
      return;
    }

    try {
      setIsSaving(true);

      const noteData = {
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        category: category.trim() || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        photos: photos,
        location: location && location.latitude !== 0 ? location : undefined,
        reminder: reminderDate
          ? {
              id: ValidationUtils.generateId(),
              dateTime: reminderDate,
              completed: false,
            }
          : undefined,
      };

      let savedNote;
      if (isEditing && noteId) {
        savedNote = await NotesService.updateNote(noteId, noteData);
      } else {
        savedNote = await NotesService.createNote(noteData);
      }

      // Schedule notification if reminder is set
      if (reminderDate && savedNote) {
        try {
          const notificationId = await NotificationService.createNoteReminder(
            savedNote,
            reminderDate
          );
          if (notificationId) {
            console.log("Reminder notification scheduled:", notificationId);
          }
        } catch (notificationError) {
          console.error("Failed to schedule notification:", notificationError);
          // Don't fail the save if notification fails
        }
      }

      setHasUnsavedChanges(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving note:", error);
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Failed to save note. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleTextChange = (field: string, value: string) => {
    setHasUnsavedChanges(true);
    switch (field) {
      case "title":
        setTitle(value);
        break;
      case "content":
        setContent(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "tags":
        setTags(value);
        break;
    }
  };

  // Camera functions
  const handleAddPhoto = async () => {
    try {
      const photo = await CameraService.selectPhotoSource();
      if (photo) {
        // Save image to app directory for permanent storage
        const savedUri = await CameraService.saveImageToAppDirectory(photo.uri);
        const savedPhoto = { ...photo, uri: savedUri };

        setPhotos((prev) => [...prev, savedPhoto]);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      Alert.alert("Error", "Failed to add photo. Please try again.");
    }
  };

  const handlePhotoPress = (photo: PhotoAttachment) => {
    // TODO: Implement full-screen photo viewer in future enhancement
    Alert.alert("Photo", "Full-screen photo viewer coming soon!");
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const photoToDelete = photos.find((p) => p.id === photoId);
      if (photoToDelete) {
        // Delete from app directory
        await CameraService.deleteImageFromAppDirectory(photoToDelete.uri);

        // Remove from state
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "Failed to delete photo. Please try again.");
    }
  };

  // Location functions
  const handleLocationSelected = (selectedLocation: LocationData) => {
    if (selectedLocation.latitude === 0 && selectedLocation.longitude === 0) {
      // Location was removed
      setLocation(undefined);
    } else {
      setLocation(selectedLocation);
    }
    setHasUnsavedChanges(true);
  };

  // Reminder functions
  const handleSetReminder = () => {
    const now = new Date();
    const defaultTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    Alert.alert(
      "Set Reminder",
      "Choose when you'd like to be reminded about this note",
      [
        {
          text: "In 1 Hour",
          onPress: () => {
            const reminderTime = new Date(now.getTime() + 60 * 60 * 1000);
            setReminderDate(reminderTime);
            setHasUnsavedChanges(true);
          },
        },
        {
          text: "In 1 Day",
          onPress: () => {
            const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            setReminderDate(reminderTime);
            setHasUnsavedChanges(true);
          },
        },
        {
          text: "In 1 Week",
          onPress: () => {
            const reminderTime = new Date(
              now.getTime() + 7 * 24 * 60 * 60 * 1000
            );
            setReminderDate(reminderTime);
            setHasUnsavedChanges(true);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleRemoveReminder = () => {
    setReminderDate(undefined);
    setHasUnsavedChanges(true);
  };

  const handleTestNotification = async () => {
    try {
      await NotificationService.showTestNotification();
      Alert.alert(
        "Success",
        "Test notification sent! Check your notifications."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#6366f1' />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                ref={titleRef}
                style={styles.titleInput}
                placeholder='Enter note title...'
                value={title}
                onChangeText={(value) => handleTextChange("title", value)}
                maxLength={100}
                returnKeyType='next'
                onSubmitEditing={() => contentRef.current?.focus()}
              />
            </View>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                ref={contentRef}
                style={styles.contentInput}
                placeholder='Write your note here...'
                value={content}
                onChangeText={(value) => handleTextChange("content", value)}
                multiline
                textAlignVertical='top'
                maxLength={10000}
              />
            </View>

            {/* Category Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder='e.g., Work, Personal, Ideas...'
                value={category}
                onChangeText={(value) => handleTextChange("category", value)}
                maxLength={50}
              />
            </View>

            {/* Tags Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tags (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder='e.g., important, todo, meeting (comma separated)'
                value={tags}
                onChangeText={(value) => handleTextChange("tags", value)}
                maxLength={200}
              />
              <Text style={styles.helperText}>
                Separate multiple tags with commas
              </Text>
            </View>

            {/* Photos Section */}
            <View style={styles.inputContainer}>
              <View style={styles.photoHeader}>
                <Text style={styles.label}>Photos</Text>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleAddPhoto}
                >
                  <Text style={styles.addPhotoText}>📷 Add Photo</Text>
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <View style={styles.photosContainer}>
                  <FlatList
                    data={photos}
                    renderItem={({ item }) => (
                      <PhotoAttachmentComponent
                        imageUri={item.uri}
                        onPress={() => handlePhotoPress(item)}
                        onDelete={() => handleDeletePhoto(item.id)}
                        editable={true}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photosList}
                  />
                </View>
              )}

              {photos.length === 0 && (
                <Text style={styles.helperText}>
                  Tap "Add Photo" to attach images to your note
                </Text>
              )}
            </View>

            {/* Location Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location Reminder (Optional)</Text>
              <LocationPicker
                onLocationSelected={handleLocationSelected}
                initialLocation={location}
              />
              <Text style={styles.helperText}>
                Get reminded about this note when you visit a specific location
              </Text>
            </View>

            {/* Time Reminder Section */}
            <View style={styles.inputContainer}>
              <View style={styles.reminderHeader}>
                <Text style={styles.label}>Time Reminder (Optional)</Text>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={handleTestNotification}
                >
                  <Text style={styles.testButtonText}>🔔 Test</Text>
                </TouchableOpacity>
              </View>

              {!reminderDate ? (
                <TouchableOpacity
                  style={styles.setReminderButton}
                  onPress={handleSetReminder}
                >
                  <Text style={styles.setReminderText}>⏰ Set Reminder</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.reminderInfo}>
                  <View style={styles.reminderDetails}>
                    <Text style={styles.reminderTitle}>⏰ Reminder Set</Text>
                    <TouchableOpacity
                      style={styles.removeReminderButton}
                      onPress={handleRemoveReminder}
                    >
                      <Text style={styles.removeReminderText}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reminderTime}>
                    {reminderDate.toLocaleDateString()} at{" "}
                    {reminderDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.reminderCountdown}>
                    {NotificationService.formatNotificationTime(reminderDate)}
                  </Text>
                </View>
              )}

              <Text style={styles.helperText}>
                Get a notification reminder at a specific time
              </Text>
            </View>

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <View style={styles.unsavedIndicator}>
                <Text style={styles.unsavedText}>● Unsaved changes</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.buttonText}>
                {isEditing ? "Update Note" : "Save Note"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
    minHeight: "100%",
  },
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  contentInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f8f9fa",
    color: "#333",
    minHeight: 150,
    height: 200,
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f8f9fa",
    color: "#333",
  },
  helperText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    fontStyle: "italic",
  },
  unsavedIndicator: {
    alignItems: "center",
    marginVertical: 10,
  },
  unsavedText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: "auto",
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
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
  // Photo styles
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addPhotoButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addPhotoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  photosContainer: {
    marginTop: 8,
  },
  photosList: {
    paddingRight: 16,
  },
  // Reminder styles
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  setReminderButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  setReminderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reminderInfo: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
    marginBottom: 8,
  },
  reminderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400e",
    flex: 1,
  },
  removeReminderButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  removeReminderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 18,
  },
  reminderTime: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  reminderCountdown: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
});
