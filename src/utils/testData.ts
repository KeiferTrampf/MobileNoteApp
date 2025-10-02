import { Note } from "../types";

export class TestDataUtils {
  /**
   * Generate sample notes for testing
   */
  static generateSampleNotes(): Omit<Note, "id" | "createdAt" | "updatedAt">[] {
    return [
      {
        title: "Welcome to Mobile Notes",
        content:
          "This is your first note! You can add photos, set location reminders, and organize with tags.",
        category: "Getting Started",
        tags: ["welcome", "tutorial"],
        photos: [],
        location: undefined,
        reminder: undefined,
      },
      {
        title: "Grocery List",
        content: "Milk, Bread, Eggs, Apples, Chicken, Rice",
        category: "Shopping",
        tags: ["groceries", "shopping"],
        photos: [],
        location: undefined,
        reminder: undefined,
      },
      {
        title: "Meeting Notes",
        content:
          "Discussed project timeline, budget allocation, and team responsibilities. Next meeting scheduled for Friday.",
        category: "Work",
        tags: ["meeting", "work", "project"],
        photos: [],
        location: undefined,
        reminder: undefined,
      },
      {
        title: "Book Recommendations",
        content:
          "The Pragmatic Programmer, Clean Code, Design Patterns, Refactoring",
        category: "Learning",
        tags: ["books", "programming", "learning"],
        photos: [],
        location: undefined,
        reminder: undefined,
      },
      {
        title: "Weekend Plans",
        content: "Visit the park, try new restaurant, movie night with friends",
        category: "Personal",
        tags: ["weekend", "fun", "social"],
        photos: [],
        location: undefined,
        reminder: undefined,
      },
    ];
  }

  /**
   * Clear all test data (useful for development)
   */
  static async clearAllData(): Promise<void> {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const noteKeys = keys.filter(
        (key: string) => key.startsWith("note_") || key === "notes_list"
      );

      if (noteKeys.length > 0) {
        await AsyncStorage.multiRemove(noteKeys);
      }

      console.log("Test data cleared successfully");
    } catch (error) {
      console.error("Error clearing test data:", error);
    }
  }

  /**
   * Populate with sample data for testing
   */
  static async populateSampleData(): Promise<void> {
    const { NotesService } = require("../services/NotesService");

    try {
      const sampleNotes = this.generateSampleNotes();

      for (const noteData of sampleNotes) {
        await NotesService.createNote(noteData);
      }

      console.log("Sample data populated successfully");
    } catch (error) {
      console.error("Error populating sample data:", error);
    }
  }
}
