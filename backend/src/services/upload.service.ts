// backend/src/services/upload.service.ts

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import env from '../config/env';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class UploadService {
  private containerClient: ContainerClient;

  constructor() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      env.AZURE_STORAGE_CONNECTION_STRING
    );
    this.containerClient = blobServiceClient.getContainerClient(
      env.AZURE_STORAGE_CONTAINER_NAME
    );
  }

  // Upload file to Azure Blob Storage
  async uploadFile(
    file: Express.Multer.File,
    folder: 'avatars' | 'messages' | 'rooms' | 'temp' = 'temp'
  ): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;

      // Get block blob client
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

      // Upload file
      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      // Get file URL
      const fileUrl = blockBlobClient.url;

      logger.info(`File uploaded to Azure Blob: ${fileName}`);

      return fileUrl;
    } catch (error) {
      logger.error('Azure Blob upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Upload avatar
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit');
      }

      const fileUrl = await this.uploadFile(file, 'avatars');
      return fileUrl;
    } catch (error) {
      logger.error('Avatar upload error:', error);
      throw error;
    }
  }

  // Upload message media
  async uploadMessageMedia(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm', 'video/quicktime',
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type');
      }

      // Validate file size (max 50MB for media)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 50MB limit');
      }

      const fileUrl = await this.uploadFile(file, 'messages');
      return fileUrl;
    } catch (error) {
      logger.error('Message media upload error:', error);
      throw error;
    }
  }

  // Delete file from Azure Blob Storage
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract blob name from URL
      const url = new URL(fileUrl);
      const blobName = url.pathname.split('/').slice(2).join('/'); // Remove container name

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();

      logger.info(`File deleted from Azure Blob: ${blobName}`);
    } catch (error) {
      logger.error('Azure Blob delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get file info
  async getFileInfo(fileUrl: string) {
    try {
      const url = new URL(fileUrl);
      const blobName = url.pathname.split('/').slice(2).join('/');

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const properties = await blockBlobClient.getProperties();

      return {
        url: fileUrl,
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
      };
    } catch (error) {
      logger.error('Get file info error:', error);
      throw error;
    }
  }

  // Generate SAS token for temporary access
  async generateSasToken(fileUrl: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      // This is a simplified version. In production, implement proper SAS token generation
      // For now, return the URL as-is since Azure Blob allows public access
      return fileUrl;
    } catch (error) {
      logger.error('Generate SAS token error:', error);
      throw error;
    }
  }
}

export default new UploadService();
