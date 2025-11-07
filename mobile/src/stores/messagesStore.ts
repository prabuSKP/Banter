// mobile/src/stores/messagesStore.ts

import { create } from 'zustand';
import messagesService, { Message, Conversation, SendMessageData } from '../services/messages';
import socketService from '../services/socket';
import { SOCKET_EVENTS } from '../constants';

interface MessagesState {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  activeConversationId: string | null;
  typingUsers: { [userId: string]: boolean };
  isLoading: boolean;
  error: string | null;
  unreadCount: number;

  // Actions
  fetchConversations: (page?: number) => Promise<void>;
  fetchMessages: (userId: string, page?: number) => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<void>;
  receiveMessage: (message: Message) => void;
  markAsRead: (messageIds: string[]) => Promise<void>;
  setActiveConversation: (userId: string | null) => void;
  updateTypingStatus: (userId: string, isTyping: boolean) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  clearError: () => void;
  initializeSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  isLoading: false,
  error: null,
  unreadCount: 0,

  fetchConversations: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { conversations } = await messagesService.getConversations(page);

      // Calculate total unread count
      const unreadCount = conversations.reduce(
        (total, conv) => total + conv.unreadCount,
        0
      );

      set({
        conversations,
        unreadCount,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch conversations',
        isLoading: false
      });
    }
  },

  fetchMessages: async (userId: string, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { messages } = await messagesService.getConversationMessages(userId, page);

      const currentMessages = get().messages[userId] || [];
      const updatedMessages = page === 1 ? messages : [...currentMessages, ...messages];

      set({
        messages: {
          ...get().messages,
          [userId]: updatedMessages,
        },
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch messages',
        isLoading: false
      });
    }
  },

  sendMessage: async (data: SendMessageData) => {
    try {
      const message = await messagesService.sendMessage(data);

      // Add message to local state
      const conversationId = data.receiverId;
      const currentMessages = get().messages[conversationId] || [];

      set({
        messages: {
          ...get().messages,
          [conversationId]: [message, ...currentMessages],
        },
      });

      // Update conversation list
      get().fetchConversations(1);

      // Emit socket event
      if (socketService.connected) {
        socketService.emitMessageSent({
          receiverId: data.receiverId,
          messageId: message.id,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send message'
      });
      throw error;
    }
  },

  receiveMessage: (message: Message) => {
    const conversationId = message.senderId;
    const currentMessages = get().messages[conversationId] || [];

    // Check if message already exists
    const exists = currentMessages.some(m => m.id === message.id);
    if (exists) return;

    set({
      messages: {
        ...get().messages,
        [conversationId]: [message, ...currentMessages],
      },
    });

    // Update conversations
    get().fetchConversations(1);

    // Auto-mark as read if conversation is active
    if (get().activeConversationId === conversationId) {
      get().markAsRead([message.id]);
    }
  },

  markAsRead: async (messageIds: string[]) => {
    try {
      await messagesService.markAsRead(messageIds);

      // Update local messages
      const messages = get().messages;
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          messageIds.includes(msg.id)
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        );
      });

      set({ messages: updatedMessages });

      // Emit socket event
      if (socketService.connected) {
        socketService.emitMessageRead(messageIds);
      }

      // Update conversations
      get().fetchConversations(1);
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  setActiveConversation: (userId: string | null) => {
    set({ activeConversationId: userId });

    // Mark unread messages as read when opening conversation
    if (userId) {
      const messages = get().messages[userId] || [];
      const unreadMessageIds = messages
        .filter(m => !m.isRead && m.receiverId !== userId)
        .map(m => m.id);

      if (unreadMessageIds.length > 0) {
        get().markAsRead(unreadMessageIds);
      }
    }
  },

  updateTypingStatus: (userId: string, isTyping: boolean) => {
    set({
      typingUsers: {
        ...get().typingUsers,
        [userId]: isTyping,
      },
    });
  },

  deleteMessage: async (messageId: string) => {
    try {
      await messagesService.deleteMessage(messageId);

      // Remove from local state
      const messages = get().messages;
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].filter(
          msg => msg.id !== messageId
        );
      });

      set({ messages: updatedMessages });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete message'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initializeSocketListeners: () => {
    // Listen for new messages
    socketService.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      get().receiveMessage(message);
    });

    // Listen for message read receipts
    socketService.on(SOCKET_EVENTS.MESSAGE_READ_RECEIPT, (data: { messageId: string; readAt: string }) => {
      const messages = get().messages;
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach(conversationId => {
        updatedMessages[conversationId] = updatedMessages[conversationId].map(msg =>
          msg.id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        );
      });

      set({ messages: updatedMessages });
    });

    // Listen for typing events
    socketService.on(SOCKET_EVENTS.TYPING_START, (data: { senderId: string }) => {
      get().updateTypingStatus(data.senderId, true);
    });

    socketService.on(SOCKET_EVENTS.TYPING_STOP, (data: { senderId: string }) => {
      get().updateTypingStatus(data.senderId, false);
    });
  },

  cleanupSocketListeners: () => {
    socketService.off(SOCKET_EVENTS.MESSAGE_NEW);
    socketService.off(SOCKET_EVENTS.MESSAGE_READ_RECEIPT);
    socketService.off(SOCKET_EVENTS.TYPING_START);
    socketService.off(SOCKET_EVENTS.TYPING_STOP);
  },
}));
