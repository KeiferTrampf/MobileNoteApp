import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note } from "../types";
import { ValidationUtils } from "../utils/validation";
import { ErrorHandler } from "../utils/ErrorHandler";

export class NotesService {
  private static readonly NOTES_KEY = "notes_list";
  private static readonly NOTE_PREFIX = "note_";

  static async getAllNotes(): Promise<Note[]> {
    try {
      const noteIds = await AsyncStorage.getItem(this.NOTES_KEY);
      if (!noteIds) return [];

      const ids: string[] = JSON.parse(noteIds);
      const notes: Note[] = [];

      for (const id of ids) {
        const note = await this.getNoteById(id);
        if (note) notes.push(note);
      }

      return notes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error("Error getting all notes:", error);
      return [];
    }
  }

  static async getNoteById(id: string): Promise<Note | null> {
    try {
      const noteData = await AsyncStorage.getItem(`${this.NOTE_PREFIX}${id}`);
      if (!noteData) return null;

      const note = JSON.parse(noteData);
      // Convert date strings back to Date objects
      note.createdAt = new Date(note.createdAt);
      note.updatedAt = new Date(note.updatedAt);
      if (note.reminder?.dateTime) {
        note.reminder.dateTime = new Date(note.reminder.dateTime);
      }

      return note;
    } catch (error) {
      console.error("Error getting note by id:", error);
      return null;
    }
  }

  static async createNote(
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt">
  ): Promise<Note> {
    try {
      // Validate note data
      const validationErrors = ValidationUtils.validateNote(noteData);
      if (validationErrors.length > 0) {
        throw ErrorHandler.createError(
          "VALIDATION_ERROR",
          `Note validation failed: ${validationErrors.join(", ")}`,
          validationErrors[0],
          true
        );
      }

      const id = ValidationUtils.generateId();
      const now = new Date();

      const note: Note = {
        ...noteData,
        id,
        title: ValidationUtils.sanitizeText(noteData.title),
        content: ValidationUtils.sanitizeText(noteData.content || ""),
        tags: noteData.tags || [],
        photos: noteData.photos || [],
        createdAt: now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(
        `${this.NOTE_PREFIX}${id}`,
        JSON.stringify(note)
      );

      // Update notes list
      const noteIds = await AsyncStorage.getItem(this.NOTES_KEY);
      const ids: string[] = noteIds ? JSON.parse(noteIds) : [];
      ids.unshift(id);
      await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(ids));

      return note;
    } catch (error) {
      console.error("Error creating note:", error);
      if (error instanceof Error && error.message.includes("validation")) {
        throw error;
      }
      throw ErrorHandler.createError(
        "STORAGE_ERROR",
        "Failed to create note",
        "Unable to save note. Please try again.",
        false
      );
    }
  }

  static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    try {
      const existingNote = await this.getNoteById(id);
      if (!existingNote) {
        throw ErrorHandler.createError(
          "NOTE_NOT_FOUND",
          `Note with id ${id} not found`,
          "Note not found. It may have been deleted.",
          true
        );
      }

      // Create merged note for validation
      const mergedNote = { ...existingNote, ...updates };
      const validationErrors = ValidationUtils.validateNote(mergedNote);
      if (validationErrors.length > 0) {
        throw ErrorHandler.createError(
          "VALIDATION_ERROR",
          `Note validation failed: ${validationErrors.join(", ")}`,
          validationErrors[0],
          true
        );
      }

      const updatedNote: Note = {
        ...existingNote,
        ...updates,
        id, // Ensure id doesn't change
        title: updates.title
          ? ValidationUtils.sanitizeText(updates.title)
          : existingNote.title,
        content: updates.content
          ? ValidationUtils.sanitizeText(updates.content)
          : existingNote.content,
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(
        `${this.NOTE_PREFIX}${id}`,
        JSON.stringify(updatedNote)
      );
      return updatedNote;
    } catch (error) {
      console.error("Error updating note:", error);
      if (
        error instanceof Error &&
        (error.message.includes("validation") ||
          error.message.includes("not found"))
      ) {
        throw error;
      }
      throw ErrorHandler.createError(
        "STORAGE_ERROR",
        "Failed to update note",
        "Unable to update note. Please try again.",
        false
      );
    }
  }

  static async deleteNote(id: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.NOTE_PREFIX}${id}`);

      // Update notes list
      const noteIds = await AsyncStorage.getItem(this.NOTES_KEY);
      if (noteIds) {
        const ids: string[] = JSON.parse(noteIds);
        const filteredIds = ids.filter((noteId) => noteId !== id);
        await AsyncStorage.setItem(this.NOTES_KEY, JSON.stringify(filteredIds));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }

  static async searchNotes(query: string): Promise<Note[]> {
    try {
      const allNotes = await this.getAllNotes();
      const lowercaseQuery = query.toLowerCase();

      return allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowercaseQuery) ||
          note.content.toLowerCase().includes(lowercaseQuery) ||
          note.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
          note.category?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error("Error searching notes:", error);
      return [];
    }
  }
}
