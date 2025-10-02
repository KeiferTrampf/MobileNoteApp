import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationData, Note } from "../types";
import { ErrorHandler } from "../utils/ErrorHandler";
import { ValidationUtils } from "../utils/validation";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static isInitialized = false;

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Request permissions
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return false;
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log("NotificationService initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing NotificationService:", error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        ErrorHandler.handle(ErrorHandler.ERRORS.NOTIFICATION_PERMISSION_DENIED);
        return false;
      }

      // For Android, set up notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Note Reminders",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366f1",
          sound: "default",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Schedule a time-based notification
   */
  static async scheduleNotification(
    notificationData: NotificationData
  ): Promise<string | null> {
    try {
      await this.initialize();

      // Validate notification data
      if (!notificationData.title || !notificationData.scheduledDate) {
        throw new Error("Invalid notification data");
      }

      // Check if the scheduled date is in the future
      if (notificationData.scheduledDate <= new Date()) {
        throw new Error("Scheduled date must be in the future");
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData.data || {},
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor(
            (notificationData.scheduledDate.getTime() - Date.now()) / 1000
          ),
        },
      });

      console.log(`Notification scheduled with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      ErrorHandler.handle({
        code: "NOTIFICATION_SCHEDULE_ERROR",
        message: "Failed to schedule notification",
        userMessage: "Unable to set reminder. Please try again.",
        recoverable: true,
      });
      return null;
    }
  }

  /**
   * Schedule a location-based notification (immediate)
   */
  static async scheduleLocationNotification(
    noteTitle: string,
    noteId: string,
    distance: number
  ): Promise<string | null> {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📍 Location Reminder",
          body: `You're near "${noteTitle}" (${distance}m away)`,
          data: {
            type: "location",
            noteId: noteId,
            distance: distance,
          },
          sound: "default",
        },
        trigger: null, // Immediate notification
      });

      console.log(`Location notification sent for note: ${noteTitle}`);
      return notificationId;
    } catch (error) {
      console.error("Error sending location notification:", error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Set up notification listeners
   */
  private static setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      this.handleNotificationPress(response);
    });
  }

  /**
   * Handle notification press
   */
  private static handleNotificationPress(
    response: Notifications.NotificationResponse
  ): void {
    try {
      const data = response.notification.request.content.data;

      if (data && data.noteId) {
        // TODO: Navigate to the specific note
        // This would require navigation context
        console.log("Should navigate to note:", data.noteId);
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
    }
  }

  /**
   * Create a reminder notification for a note
   */
  static async createNoteReminder(
    note: Note,
    reminderDate: Date
  ): Promise<string | null> {
    try {
      const notificationData: NotificationData = {
        id: ValidationUtils.generateId(),
        title: `📝 Note Reminder: ${note.title}`,
        body: note.content
          ? `${note.content.substring(0, 100)}${
              note.content.length > 100 ? "..." : ""
            }`
          : "Tap to view your note",
        data: {
          type: "reminder",
          noteId: note.id,
        },
        scheduledDate: reminderDate,
      };

      return await this.scheduleNotification(notificationData);
    } catch (error) {
      console.error("Error creating note reminder:", error);
      return null;
    }
  }

  /**
   * Get notification permission status
   */
  static async getPermissionStatus(): Promise<
    "granted" | "denied" | "undetermined"
  > {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status as "granted" | "denied" | "undetermined";
    } catch (error) {
      console.error("Error getting permission status:", error);
      return "undetermined";
    }
  }

  /**
   * Show immediate notification (for testing)
   */
  static async showTestNotification(): Promise<void> {
    try {
      await this.initialize();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Test Notification",
          body: "Your notification system is working perfectly!",
          data: { type: "test" },
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error("Error showing test notification:", error);
    }
  }

  /**
   * Format notification time for display
   */
  static formatNotificationTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 0) {
      return "Past due";
    }

    if (diffInMinutes < 60) {
      return `In ${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `In ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `In ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`;
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    scheduled: number;
    permission: string;
  }> {
    try {
      const scheduled = await this.getScheduledNotifications();
      const permission = await this.getPermissionStatus();

      return {
        scheduled: scheduled.length,
        permission,
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        scheduled: 0,
        permission: "undetermined",
      };
    }
  }
}
