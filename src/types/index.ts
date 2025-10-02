// Core data types for the Mobile Note App

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  photos: PhotoAttachment[];
  location?: LocationData;
  reminder?: ReminderData;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoAttachment {
  id: string;
  uri: string;
  width: number;
  height: number;
  size: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  radius: number; // meters for geofencing
}

export interface ReminderData {
  id: string;
  dateTime: Date;
  notificationId?: string;
  completed: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduledDate: Date;
}

export interface AppError {
  code: string;
  message: string;
  recoverable: boolean;
  userMessage: string;
}

// Navigation types
export type RootStackParamList = {
  NoteList: undefined;
  NoteEditor: { noteId?: string };
  NoteView: { noteId: string };
};

// UI State types
export interface SearchState {
  query: string;
  category: string;
  sortBy: "date" | "title" | "category";
  ascending: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  defaultCategory: string;
  autoSave: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Permission types
export type PermissionStatus = "granted" | "denied" | "undetermined";

export interface PermissionState {
  camera: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
}
