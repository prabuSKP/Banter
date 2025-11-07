// mobile/src/services/messages.ts

import api from './api';
import { API_ENDPOINTS } from '../constants';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  };
  isRead: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
  };
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatar: string | null;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    id: string;
    content: string;
    type: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif';
  metadata?: any;
}

class MessagesService {
  // Get all conversations
  async getConversations(page: number = 1, limit: number = 50) {
    const response = await api.get(API_ENDPOINTS.GET_MESSAGES, {
      params: { page, limit },
    });
    return {
      conversations: response.data.data as Conversation[],
      pagination: response.data.pagination,
    };
  }

  // Get messages for a specific conversation
  async getConversationMessages(
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const response = await api.get(API_ENDPOINTS.GET_CONVERSATION(userId), {
      params: { page, limit },
    });
    return {
      messages: response.data.data as Message[],
      pagination: response.data.pagination,
    };
  }

  // Send a message
  async sendMessage(data: SendMessageData) {
    const response = await api.post(API_ENDPOINTS.SEND_MESSAGE, data);
    return response.data.data as Message;
  }

  // Mark messages as read
  async markAsRead(messageIds: string[]) {
    const response = await api.post(API_ENDPOINTS.MARK_AS_READ, {
      messageIds,
    });
    return response.data;
  }

  // Upload media file
  async uploadMedia(file: {
    uri: string;
    type: string;
    name: string;
  }): Promise<{ url: string; metadata: any }> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }

  // Search messages
  async searchMessages(query: string, conversationId?: string) {
    const response = await api.get('/messages/search', {
      params: { q: query, conversationId },
    });
    return response.data.data as Message[];
  }

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/messages/unread-count');
    return response.data.data as { count: number };
  }
}

export default new MessagesService();
