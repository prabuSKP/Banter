// mobile/tests/services/friends.test.ts

import friendsService from '../../src/services/friends';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

describe('FriendsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      const receiverId = 'user123';
      const mockResponse = {
        success: true,
        message: 'Friend request sent',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await friendsService.sendFriendRequest(receiverId);

      expect(api.post).toHaveBeenCalledWith('/friends/request', { receiverId });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when request fails', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Already friends'));

      await expect(friendsService.sendFriendRequest('user123')).rejects.toThrow('Already friends');
    });
  });

  describe('getFriendRequests', () => {
    it('should fetch friend requests successfully', async () => {
      const mockRequests = [
        {
          id: 'req1',
          status: 'pending',
          message: null,
          createdAt: '2025-01-07T00:00:00Z',
          sender: {
            id: 'user1',
            fullName: 'John Doe',
            username: 'johndoe',
            avatar: null,
            bio: 'Hello',
            isPremium: false,
          },
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockRequests },
      });

      const result = await friendsService.getFriendRequests();

      expect(api.get).toHaveBeenCalledWith('/friends/requests');
      expect(result).toEqual(mockRequests);
      expect(result).toHaveLength(1);
      expect(result[0].sender.fullName).toBe('John Doe');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept friend request successfully', async () => {
      const requestId = 'req123';
      const mockResponse = {
        success: true,
        message: 'Friend request accepted',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await friendsService.acceptFriendRequest(requestId);

      expect(api.post).toHaveBeenCalledWith(`/friends/accept/${requestId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject friend request successfully', async () => {
      const requestId = 'req123';
      const mockResponse = {
        success: true,
        message: 'Friend request rejected',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await friendsService.rejectFriendRequest(requestId);

      expect(api.post).toHaveBeenCalledWith(`/friends/reject/${requestId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFriends', () => {
    it('should fetch friends list with default pagination', async () => {
      const mockFriends = [
        {
          id: 'friend1',
          fullName: 'Jane Doe',
          username: 'janedoe',
          avatar: null,
          bio: 'Hi there',
          isPremium: true,
          isOnline: true,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const mockPagination = {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockFriends,
          pagination: mockPagination,
        },
      });

      const result = await friendsService.getFriends();

      expect(api.get).toHaveBeenCalledWith('/friends', {
        params: { page: 1, limit: 50 },
      });
      expect(result.friends).toEqual(mockFriends);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should fetch friends with custom pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: [],
          pagination: { page: 2, limit: 20, total: 0, totalPages: 0 },
        },
      });

      await friendsService.getFriends(2, 20);

      expect(api.get).toHaveBeenCalledWith('/friends', {
        params: { page: 2, limit: 20 },
      });
    });
  });

  describe('removeFriend', () => {
    it('should remove friend successfully', async () => {
      const friendId = 'friend123';
      const mockResponse = {
        success: true,
        message: 'Friend removed',
      };

      (api.delete as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await friendsService.removeFriend(friendId);

      expect(api.delete).toHaveBeenCalledWith(`/friends/${friendId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFriendSuggestions', () => {
    it('should fetch friend suggestions successfully', async () => {
      const mockSuggestions = [
        {
          id: 'user2',
          fullName: 'Bob Smith',
          username: 'bobsmith',
          avatar: null,
          isPremium: false,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: {
          data: mockSuggestions,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      });

      const result = await friendsService.getFriendSuggestions();

      expect(api.get).toHaveBeenCalledWith('/friends/suggestions', {
        params: { page: 1, limit: 20 },
      });
      expect(result.suggestions).toEqual(mockSuggestions);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const query = 'john';
      const mockResults = [
        {
          id: 'user3',
          fullName: 'John Smith',
          username: 'johnsmith',
          avatar: null,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({
        data: { data: mockResults },
      });

      const result = await friendsService.searchUsers(query);

      expect(api.get).toHaveBeenCalledWith('/users/search', {
        params: { query },
      });
      expect(result).toEqual(mockResults);
    });

    it('should return empty array when no results found', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: [] },
      });

      const result = await friendsService.searchUsers('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
