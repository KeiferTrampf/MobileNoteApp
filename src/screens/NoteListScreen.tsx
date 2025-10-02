import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList, Note } from "../types";
import { NotesService } from "../services/NotesService";
import { DataTransformUtils } from "../utils/dataTransform";
import { TestDataUtils } from "../utils/testData";
import NoteCard from "../components/NoteCard";

type NoteListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NoteList"
>;

interface Props {
  navigation: NoteListScreenNavigationProp;
}

export default function NoteListScreen({ navigation }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const allNotes = await NotesService.getAllNotes();
      setNotes(allNotes);
      setFilteredNotes(allNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
      Alert.alert("Error", "Failed to load notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter((note) =>
        DataTransformUtils.noteToSearchableText(note).includes(
          query.toLowerCase()
        )
      );
      setFilteredNotes(filtered);
    }
  };

  const handleAddNote = () => {
    navigation.navigate("NoteEditor", {});
  };

  const handleNotePress = (noteId: string) => {
    navigation.navigate("NoteView", { noteId });
  };

  const handleEditNote = (noteId: string) => {
    navigation.navigate("NoteEditor", { noteId });
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await NotesService.deleteNote(noteId);
            await loadNotes(); // Refresh the list
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Error", "Failed to delete note. Please try again.");
          }
        },
      },
    ]);
  };

  const handleAddSampleData = async () => {
    try {
      await TestDataUtils.populateSampleData();
      await loadNotes();
      Alert.alert("Success", "Sample notes added!");
    } catch (error) {
      console.error("Error adding sample data:", error);
      Alert.alert("Error", "Failed to add sample data.");
    }
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={handleNotePress}
      onEdit={handleEditNote}
      onDelete={handleDeleteNote}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first note or add some sample data to get started
      </Text>
      <TouchableOpacity
        style={styles.sampleButton}
        onPress={handleAddSampleData}
      >
        <Text style={styles.sampleButtonText}>Add Sample Notes</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Search notes...'
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode='while-editing'
        />
      </View>

      {/* Add Note Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
        <Text style={styles.addButtonText}>+ Add Note</Text>
      </TouchableOpacity>

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addButton: {
    backgroundColor: "#6366f1",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  sampleButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  sampleButtonText: {
    color: "#6366f1",
    fontSize: 16,
    fontWeight: "bold",
  },
});
