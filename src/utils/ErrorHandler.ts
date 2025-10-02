import { Alert } from "react-native";
import { AppError } from "../types";

export class ErrorHandler {
  static handle(error: AppError): void {
    // Log error for debugging
    console.error(`[${error.code}] ${error.message}`);

    // Show user-friendly message
    if (error.recoverable) {
      // For recoverable errors, you might want to use a toast library
      // For now, we'll use Alert
      Alert.alert("Notice", error.userMessage);
    } else {
      Alert.alert("Error", error.userMessage);
    }
  }

  static createError(
    code: string,
    message: string,
    userMessage: string,
    recoverable: boolean = true
  ): AppError {
    return {
      code,
      message,
      userMessage,
      recoverable,
    };
  }

  // Common error types
  static readonly ERRORS = {
    CAMERA_PERMISSION_DENIED: {
      code: "CAMERA_PERMISSION_DENIED",
      message: "Camera permission was denied by user",
      userMessage:
        "Camera access is required to attach photos to notes. Please enable camera permissions in settings.",
      recoverable: true,
    },
    LOCATION_PERMISSION_DENIED: {
      code: "LOCATION_PERMISSION_DENIED",
      message: "Location permission was denied by user",
      userMessage:
        "Location access is required for location-based reminders. Please enable location permissions in settings.",
      recoverable: true,
    },
    NOTIFICATION_PERMISSION_DENIED: {
      code: "NOTIFICATION_PERMISSION_DENIED",
      message: "Notification permission was denied by user",
      userMessage:
        "Notification access is required for reminders. Please enable notification permissions in settings.",
      recoverable: true,
    },
    STORAGE_ERROR: {
      code: "STORAGE_ERROR",
      message: "Failed to access local storage",
      userMessage: "Unable to save data. Please check available storage space.",
      recoverable: false,
    },
  };
}
