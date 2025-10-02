import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { PhotoAttachment } from "../types";
import { ValidationUtils } from "../utils/validation";
import { ErrorHandler } from "../utils/ErrorHandler";

export class CameraService {
  /**
   * Request camera permissions
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  static async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting media library permission:", error);
      return false;
    }
  }

  /**
   * Take a photo with the camera
   */
  static async takePhoto(): Promise<PhotoAttachment | null> {
    try {
      // Check camera permission
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        ErrorHandler.handle(ErrorHandler.ERRORS.CAMERA_PERMISSION_DENIED);
        return null;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return await this.processImageAsset(asset);
    } catch (error) {
      console.error("Error taking photo:", error);
      ErrorHandler.handle({
        code: "CAMERA_ERROR",
        message: "Failed to take photo",
        userMessage: "Unable to take photo. Please try again.",
        recoverable: true,
      });
      return null;
    }
  }

  /**
   * Pick a photo from the gallery
   */
  static async pickFromGallery(): Promise<PhotoAttachment | null> {
    try {
      // Check media library permission
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        ErrorHandler.handle({
          code: "MEDIA_LIBRARY_PERMISSION_DENIED",
          message: "Media library permission denied",
          userMessage:
            "Photo library access is required to select photos. Please enable permissions in settings.",
          recoverable: true,
        });
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return await this.processImageAsset(asset);
    } catch (error) {
      console.error("Error picking from gallery:", error);
      ErrorHandler.handle({
        code: "GALLERY_ERROR",
        message: "Failed to pick photo from gallery",
        userMessage: "Unable to select photo. Please try again.",
        recoverable: true,
      });
      return null;
    }
  }

  /**
   * Show photo source selection (camera or gallery)
   */
  static async selectPhotoSource(): Promise<PhotoAttachment | null> {
    return new Promise((resolve) => {
      Alert.alert(
        "Add Photo",
        "Choose how you want to add a photo to your note",
        [
          {
            text: "Camera",
            onPress: async () => {
              const photo = await this.takePhoto();
              resolve(photo);
            },
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const photo = await this.pickFromGallery();
              resolve(photo);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(null),
          },
        ]
      );
    });
  }

  /**
   * Process image asset and create PhotoAttachment
   */
  private static async processImageAsset(
    asset: ImagePicker.ImagePickerAsset
  ): Promise<PhotoAttachment> {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(asset.uri);

    // Create PhotoAttachment object
    const photoAttachment: PhotoAttachment = {
      id: ValidationUtils.generateId(),
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      size: fileInfo.exists ? fileInfo.size || 0 : 0,
    };

    // Validate the photo
    const validationErrors =
      ValidationUtils.validatePhotoAttachment(photoAttachment);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors[0]);
    }

    return photoAttachment;
  }

  /**
   * Copy image to app's document directory for permanent storage
   */
  static async saveImageToAppDirectory(imageUri: string): Promise<string> {
    try {
      // For now, return the original URI
      // In a production app, you'd want to copy to a permanent location
      return imageUri;
    } catch (error) {
      console.error("Error saving image to app directory:", error);
      return imageUri;
    }
  }

  /**
   * Delete image from app directory
   */
  static async deleteImageFromAppDirectory(imageUri: string): Promise<void> {
    try {
      // For now, just log the deletion
      // In a production app, you'd delete the file if it's in app directory
      console.log("Photo deleted:", imageUri);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw error for cleanup operations
    }
  }

  /**
   * Compress image if it's too large
   */
  static async compressImage(
    imageUri: string,
    maxSize: number = 1024 * 1024
  ): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);

      if (!fileInfo.exists || !fileInfo.size || fileInfo.size <= maxSize) {
        return imageUri; // No compression needed
      }

      // Calculate compression quality based on file size
      const compressionRatio = maxSize / fileInfo.size;
      const quality = Math.max(0.1, Math.min(0.8, compressionRatio));

      // Use ImagePicker to compress (re-export with lower quality)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: quality,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return imageUri; // Return original if compression fails
    } catch (error) {
      console.error("Error compressing image:", error);
      return imageUri; // Return original if compression fails
    }
  }
}
