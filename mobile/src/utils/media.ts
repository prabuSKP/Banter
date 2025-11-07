// mobile/src/utils/media.ts

import * as ImagePicker from 'expo-image-picker';
import messagesService from '../services/messages';

export interface MediaPickerResult {
  uri: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
}

export class MediaUtils {
  // Request camera permissions
  static async requestCameraPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  // Request media library permissions
  static async requestMediaLibraryPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  // Pick image from library
  static async pickImage(): Promise<MediaPickerResult | null> {
    const hasPermission = await this.requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      exif: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }

  // Pick video from library
  static async pickVideo(): Promise<MediaPickerResult | null> {
    const hasPermission = await this.requestMediaLibraryPermissions();
    if (!hasPermission) {
      throw new Error('Media library permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60, // 60 seconds max
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'video',
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
    };
  }

  // Take photo with camera
  static async takePhoto(): Promise<MediaPickerResult | null> {
    const hasPermission = await this.requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      exif: false,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      type: 'image',
      fileName: `photo_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };
  }

  // Upload media file
  static async uploadMedia(media: MediaPickerResult): Promise<{
    url: string;
    thumbnailUrl?: string;
    metadata: any;
  }> {
    const fileExtension = media.fileName.split('.').pop() || 'jpg';
    const mimeType = media.type === 'image'
      ? `image/${fileExtension}`
      : `video/${fileExtension}`;

    const file = {
      uri: media.uri,
      type: mimeType,
      name: media.fileName,
    };

    const result = await messagesService.uploadMedia(file);

    return {
      url: result.url,
      thumbnailUrl: result.metadata?.thumbnailUrl,
      metadata: {
        fileName: media.fileName,
        fileSize: media.fileSize,
        width: media.width,
        height: media.height,
        duration: media.duration,
      },
    };
  }

  // Format file size
  static formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Format duration
  static formatDuration(seconds?: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

export default MediaUtils;
