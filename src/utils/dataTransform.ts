import { Note, PhotoAttachment, LocationData } from "../types";

export class DataTransformUtils {
  /**
   * Convert a note to a format suitable for search indexing
   */
  static noteToSearchableText(note: Note): string {
    const searchableFields = [
      note.title,
      note.content,
      note.category || "",
      ...note.tags,
      note.location?.address || "",
    ];

    return searchableFields
      .filter((field) => field.trim().length > 0)
      .join(" ")
      .toLowerCase();
  }

  /**
   * Extract preview text from note content
   */
  static getPreviewText(content: string, maxLength: number = 100): string {
    if (!content || content.trim().length === 0) {
      return "No content";
    }

    const cleanContent = content.replace(/\s+/g, " ").trim();
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }

    return cleanContent.substring(0, maxLength - 3) + "...";
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
    }

    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return days === 1 ? "1 day ago" : `${days} days ago`;
    }

    return date.toLocaleDateString();
  }

  /**
   * Calculate storage size of a note
   */
  static calculateNoteSize(note: Note): number {
    const noteString = JSON.stringify(note);
    return new Blob([noteString]).size;
  }

  /**
   * Group notes by date
   */
  static groupNotesByDate(notes: Note[]): { [key: string]: Note[] } {
    const groups: { [key: string]: Note[] } = {};

    notes.forEach((note) => {
      const dateKey = note.updatedAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(note);
    });

    return groups;
  }

  /**
   * Filter notes by category
   */
  static filterNotesByCategory(notes: Note[], category: string): Note[] {
    if (!category || category === "all") {
      return notes;
    }

    return notes.filter(
      (note) => note.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get unique categories from notes
   */
  static getUniqueCategories(notes: Note[]): string[] {
    const categories = new Set<string>();

    notes.forEach((note) => {
      if (note.category && note.category.trim().length > 0) {
        categories.add(note.category.trim());
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Get unique tags from notes
   */
  static getUniqueTags(notes: Note[]): string[] {
    const tags = new Set<string>();

    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        if (tag.trim().length > 0) {
          tags.add(tag.trim());
        }
      });
    });

    return Array.from(tags).sort();
  }

  /**
   * Sort notes by different criteria
   */
  static sortNotes(
    notes: Note[],
    sortBy: "date" | "title" | "category",
    ascending: boolean = false
  ): Note[] {
    const sortedNotes = [...notes];

    sortedNotes.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          const categoryA = a.category || "";
          const categoryB = b.category || "";
          comparison = categoryA.localeCompare(categoryB);
          break;
      }

      return ascending ? comparison : -comparison;
    });

    return sortedNotes;
  }
}
