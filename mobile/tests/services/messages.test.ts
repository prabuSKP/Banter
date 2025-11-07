// mobile/tests/services/messages.test.ts

import messagesService from '../../src/services/messages';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('MessagesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fetch conversations successfully', async () => {
      const mockConversations = [
        {
          id: 'conv1',
          user: {
            id: 'user1',
            fullName: 'John Doe',
            username: 'johndoe',
            avatar: null,
            isOnline: true,
            lastSeen: '2025-10-07T00:00:00Z',
          },
          lastMessage: {
            id: 'msg1',
            content: 'Hello!',
            type: 'text',
            senderId: 'user1',
            createdAt: '2025-10-07T00:00:00Z',
            isRead: false,
          },
          unreadCount: 1,
          updatedAt: '2025-10-07T00:00:00Z',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockConversations,
          pagination: { page: 1, limit: 50, total: 1 },
        },
      });

      const result = await messagesService.getConversations(1, 50);

      expect(api.get).toHaveBeenCalledWith('/messages', {
        params: { page: 1, limit: 50 },
      });
      expect(result.conversations).toEqual(mockConversations);
      expect(result.pagination).toBeDefined();
    });

    it('should handle errors when fetching conversations', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(messagesService.getConversations()).rejects.toThrow('Network error');
    });
  });

  describe('getConversationMessages', () => {
    it('should fetch messages for a conversation', async () => {
      const mockMessages = [
        {
          id: 'msg1',
          conversationId: 'conv1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hello!',
          type: 'text',
          isRead: false,
          deliveredAt: null,
          readAt: null,
          createdAt: '2025-10-07T00:00:00Z',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockMessages,
          pagination: { page: 1, limit: 50, total: 1 },
        },
      });

      const result = await messagesService.getConversationMessages('user1', 1, 50);

      expect(api.get).toHaveBeenCalledWith('/messages/conversation/user1', {
        params: { page: 1, limit: 50 },
      });
      expect(result.messages).toEqual(mockMessages);
    });

    it('should handle errors when fetching messages', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        messagesService.getConversationMessages('user1')
      ).rejects.toThrow('Network error');
    });
  });

  describe('sendMessage', () => {
    it('should send a text message successfully', async () => {
      const mockMessage = {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello!',
        type: 'text',
        isRead: false,
        deliveredAt: null,
        readAt: null,
        createdAt: '2025-10-07T00:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: mockMessage },
      });

      const messageData = {
        receiverId: 'user2',
        content: 'Hello!',
        type: 'text' as const,
      };

      const result = await messagesService.sendMessage(messageData);

      expect(api.post).toHaveBeenCalledWith('/messages', messageData);
      expect(result).toEqual(mockMessage);
    });

    it('should send an image message successfully', async () => {
      const mockMessage = {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'https://example.com/image.jpg',
        type: 'image',
        metadata: {
          fileName: 'image.jpg',
          fileSize: 102400,
          width: 800,
          height: 600,
        },
        isRead: false,
        deliveredAt: null,
        readAt: null,
        createdAt: '2025-10-07T00:00:00Z',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: mockMessage },
      });

      const messageData = {
        receiverId: 'user2',
        content: 'https://example.com/image.jpg',
        type: 'image' as const,
        metadata: {
          fileName: 'image.jpg',
          fileSize: 102400,
          width: 800,
          height: 600,
        },
      };

      const result = await messagesService.sendMessage(messageData);

      expect(api.post).toHaveBeenCalledWith('/messages', messageData);
      expect(result.type).toBe('image');
      expect(result.metadata).toBeDefined();
    });

    it('should handle errors when sending message', async () => {
      (api.post as jest.Mock).mockRejectedValue(
        new Error('Failed to send message')
      );

      const messageData = {
        receiverId: 'user2',
        content: 'Hello!',
        type: 'text' as const,
      };

      await expect(messagesService.sendMessage(messageData)).rejects.toThrow(
        'Failed to send message'
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read successfully', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const messageIds = ['msg1', 'msg2', 'msg3'];

      const result = await messagesService.markAsRead(messageIds);

      expect(api.post).toHaveBeenCalledWith('/messages/read', {
        messageIds,
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle errors when marking as read', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(messagesService.markAsRead(['msg1'])).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('uploadMedia', () => {
    it('should upload media file successfully', async () => {
      const mockResponse = {
        url: 'https://example.com/uploaded-image.jpg',
        metadata: {
          thumbnailUrl: 'https://example.com/thumbnail.jpg',
          width: 800,
          height: 600,
        },
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      const file = {
        uri: 'file:///path/to/image.jpg',
        type: 'image/jpeg',
        name: 'image.jpg',
      };

      const result = await messagesService.uploadMedia(file);

      expect(api.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle upload errors', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      const file = {
        uri: 'file:///path/to/image.jpg',
        type: 'image/jpeg',
        name: 'image.jpg',
      };

      await expect(messagesService.uploadMedia(file)).rejects.toThrow(
        'Upload failed'
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully', async () => {
      (api.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await messagesService.deleteMessage('msg1');

      expect(api.delete).toHaveBeenCalledWith('/messages/msg1');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors when deleting message', async () => {
      (api.delete as jest.Mock).mockRejectedValue(
        new Error('Failed to delete')
      );

      await expect(messagesService.deleteMessage('msg1')).rejects.toThrow(
        'Failed to delete'
      );
    });
  });

  describe('searchMessages', () => {
    it('should search messages successfully', async () => {
      const mockResults = [
        {
          id: 'msg1',
          content: 'Hello world',
          type: 'text',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockResults },
      });

      const result = await messagesService.searchMessages('hello');

      expect(api.get).toHaveBeenCalledWith('/messages/search', {
        params: { q: 'hello', conversationId: undefined },
      });
      expect(result).toEqual(mockResults);
    });

    it('should search within a conversation', async () => {
      const mockResults = [
        {
          id: 'msg1',
          content: 'Hello',
          type: 'text',
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockResults },
      });

      const result = await messagesService.searchMessages('hello', 'conv1');

      expect(api.get).toHaveBeenCalledWith('/messages/search', {
        params: { q: 'hello', conversationId: 'conv1' },
      });
      expect(result).toEqual(mockResults);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count successfully', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: { count: 5 } },
      });

      const result = await messagesService.getUnreadCount();

      expect(api.get).toHaveBeenCalledWith('/messages/unread-count');
      expect(result).toEqual({ count: 5 });
    });

    it('should handle errors when getting unread count', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(messagesService.getUnreadCount()).rejects.toThrow(
        'Network error'
      );
    });
  });
});
