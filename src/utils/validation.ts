import { Note, PhotoAttachment, LocationData, ReminderData } from "../types";

export class ValidationUtils {
  static validateNote(note: Partial<Note>): string[] {
    const errors: string[] = [];

    if (!note.title || note.title.trim().length === 0) {
      errors.push("Note title is required");
    }

    if (note.title && note.title.length > 100) {
      errors.push("Note title must be less than 100 characters");
    }

    if (note.content && note.content.length > 10000) {
      errors.push("Note content must be less than 10,000 characters");
    }

    if (note.tags && note.tags.length > 10) {
      errors.push("Maximum 10 tags allowed per note");
    }

    if (note.photos && note.photos.length > 20) {
      errors.push("Maximum 20 photos allowed per note");
    }

    return errors;
  }

  static validatePhotoAttachment(photo: Partial<PhotoAttachment>): string[] {
    const errors: string[] = [];

    if (!photo.uri || photo.uri.trim().length === 0) {
      errors.push("Photo URI is required");
    }

    if (photo.size && photo.size > 10 * 1024 * 1024) {
      // 10MB limit
      errors.push("Photo size must be less than 10MB");
    }

    if (photo.width && photo.width > 4000) {
      errors.push("Photo width must be less than 4000px");
    }

    if (photo.height && photo.height > 4000) {
      errors.push("Photo height must be less than 4000px");
    }

    return errors;
  }

  static validateLocation(location: Partial<LocationData>): string[] {
    const errors: string[] = [];

    if (
      location.latitude !== undefined &&
      (location.latitude < -90 || location.latitude > 90)
    ) {
      errors.push("Latitude must be between -90 and 90 degrees");
    }

    if (
      location.longitude !== undefined &&
      (location.longitude < -180 || location.longitude > 180)
    ) {
      errors.push("Longitude must be between -180 and 180 degrees");
    }

    if (
      location.radius !== undefined &&
      (location.radius < 10 || location.radius > 1000)
    ) {
      errors.push("Geofence radius must be between 10 and 1000 meters");
    }

    return errors;
  }

  static validateReminder(reminder: Partial<ReminderData>): string[] {
    const errors: string[] = [];

    if (reminder.dateTime && reminder.dateTime <= new Date()) {
      errors.push("Reminder date must be in the future");
    }

    return errors;
  }

  static sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
  }

  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
