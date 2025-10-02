import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types";

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

  const handleEdit = () => {
    navigation.navigate("NoteEditor", { noteId });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Sample note data for demonstration
  const sampleNote = {
    id: noteId,
    title: "Sample Note",
    content:
      "This is a sample note to demonstrate the note view functionality. In Task 4, we'll load real note data from our NotesService.",
    category: "Demo",
    tags: ["sample", "demo"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{sampleNote.title}</Text>

        <View style={styles.metaInfo}>
          <Text style={styles.category}>Category: {sampleNote.category}</Text>
          <Text style={styles.date}>
            Updated: {sampleNote.updatedAt.toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.tagsContainer}>
          {sampleNote.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.noteContent}>{sampleNote.content}</Text>

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
    marginBottom: 30,
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
});
