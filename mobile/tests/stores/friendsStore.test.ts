// mobile/tests/stores/friendsStore.test.ts

import { renderHook, act } from '@testing-library/react-native';
import { useFriendsStore } from '../../src/stores/friendsStore';
import friendsService from '../../src/services/friends';

jest.mock('../../src/services/friends');

describe('FriendsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useFriendsStore.setState({
      friends: [],
      friendRequests: [],
      suggestions: [],
      searchResults: [],
      isLoading: false,
      error: null,
    });
  });

  describe('fetchFriends', () => {
    it('should fetch and set friends successfully', async () => {
      const mockFriends = [
        {
          id: 'friend1',
          fullName: 'John Doe',
          username: 'johndoe',
          avatar: null,
          bio: null,
          isPremium: false,
          isOnline: true,
          createdAt: '2025-01-01',
        },
      ];

      (friendsService.getFriends as jest.Mock).mockResolvedValue({
        friends: mockFriends,
        pagination: {},
      });

      const { result } = renderHook(() => useFriendsStore());

      await act(async () => {
        await result.current.fetchFriends(1);
      });

      expect(friendsService.getFriends).toHaveBeenCalledWith(1);
      expect(result.current.friends).toEqual(mockFriends);
      expect(result.current.isLoading).toBe(false);
    });

    it('should append friends for page > 1', async () => {
      const page1Friends = [{ id: 'friend1', fullName: 'John' } as any];
      const page2Friends = [{ id: 'friend2', fullName: 'Jane' } as any];

      const { result } = renderHook(() => useFriendsStore());

      // Set initial friends
      act(() => {
        useFriendsStore.setState({ friends: page1Friends });
      });

      (friendsService.getFriends as jest.Mock).mockResolvedValue({
        friends: page2Friends,
        pagination: {},
      });

      await act(async () => {
        await result.current.fetchFriends(2);
      });

      expect(result.current.friends).toHaveLength(2);
      expect(result.current.friends[1].fullName).toBe('Jane');
    });
  });

  describe('fetchFriendRequests', () => {
    it('should fetch friend requests successfully', async () => {
      const mockRequests = [
        {
          id: 'req1',
          status: 'pending',
          message: null,
          createdAt: '2025-01-07',
          sender: {
            id: 'user1',
            fullName: 'Alice',
            username: 'alice',
            avatar: null,
            bio: null,
            isPremium: false,
          },
        },
      ];

      (friendsService.getFriendRequests as jest.Mock).mockResolvedValue(mockRequests);

      const { result } = renderHook(() => useFriendsStore());

      await act(async () => {
        await result.current.fetchFriendRequests();
      });

      expect(friendsService.getFriendRequests).toHaveBeenCalled();
      expect(result.current.friendRequests).toEqual(mockRequests);
    });
  });

  describe('sendFriendRequest', () => {
    it('should send friend request and refresh suggestions', async () => {
      const userId = 'user123';
      const mockSuggestions = [];

      (friendsService.sendFriendRequest as jest.Mock).mockResolvedValue({
        success: true,
      });
      (friendsService.getFriendSuggestions as jest.Mock).mockResolvedValue({
        suggestions: mockSuggestions,
        pagination: {},
      });

      const { result } = renderHook(() => useFriendsStore());

      await act(async () => {
        await result.current.sendFriendRequest(userId);
      });

      expect(friendsService.sendFriendRequest).toHaveBeenCalledWith(userId);
      expect(friendsService.getFriendSuggestions).toHaveBeenCalledWith(1);
    });

    it('should throw error when request fails', async () => {
      (friendsService.sendFriendRequest as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Already friends' } },
      });

      const { result } = renderHook(() => useFriendsStore());

      await expect(
        act(async () => {
          await result.current.sendFriendRequest('user123');
        })
      ).rejects.toBeDefined();

      expect(result.current.error).toBe('Already friends');
    });
  });

  describe('acceptRequest', () => {
    it('should accept request and update state', async () => {
      const requestId = 'req123';
      const mockRequests = [
        { id: 'req123', sender: { id: 'user1' } } as any,
        { id: 'req456', sender: { id: 'user2' } } as any,
      ];

      (friendsService.acceptFriendRequest as jest.Mock).mockResolvedValue({
        success: true,
      });
      (friendsService.getFriends as jest.Mock).mockResolvedValue({
        friends: [],
        pagination: {},
      });

      const { result } = renderHook(() => useFriendsStore());

      // Set initial requests
      act(() => {
        useFriendsStore.setState({ friendRequests: mockRequests });
      });

      await act(async () => {
        await result.current.acceptRequest(requestId);
      });

      expect(friendsService.acceptFriendRequest).toHaveBeenCalledWith(requestId);
      expect(result.current.friendRequests).toHaveLength(1);
      expect(result.current.friendRequests[0].id).toBe('req456');
    });
  });

  describe('rejectRequest', () => {
    it('should reject request and remove from list', async () => {
      const requestId = 'req123';
      const mockRequests = [
        { id: 'req123', sender: { id: 'user1' } } as any,
        { id: 'req456', sender: { id: 'user2' } } as any,
      ];

      (friendsService.rejectFriendRequest as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useFriendsStore());

      // Set initial requests
      act(() => {
        useFriendsStore.setState({ friendRequests: mockRequests });
      });

      await act(async () => {
        await result.current.rejectRequest(requestId);
      });

      expect(friendsService.rejectFriendRequest).toHaveBeenCalledWith(requestId);
      expect(result.current.friendRequests).toHaveLength(1);
      expect(result.current.friendRequests[0].id).toBe('req456');
    });
  });

  describe('removeFriend', () => {
    it('should remove friend from list', async () => {
      const friendId = 'friend123';
      const mockFriends = [
        { id: 'friend123', fullName: 'John' } as any,
        { id: 'friend456', fullName: 'Jane' } as any,
      ];

      (friendsService.removeFriend as jest.Mock).mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useFriendsStore());

      // Set initial friends
      act(() => {
        useFriendsStore.setState({ friends: mockFriends });
      });

      await act(async () => {
        await result.current.removeFriend(friendId);
      });

      expect(friendsService.removeFriend).toHaveBeenCalledWith(friendId);
      expect(result.current.friends).toHaveLength(1);
      expect(result.current.friends[0].id).toBe('friend456');
    });
  });

  describe('searchUsers', () => {
    it('should search users and set results', async () => {
      const query = 'john';
      const mockResults = [
        { id: 'user1', fullName: 'John Doe', username: 'johndoe' },
      ];

      (friendsService.searchUsers as jest.Mock).mockResolvedValue(mockResults);

      const { result } = renderHook(() => useFriendsStore());

      await act(async () => {
        await result.current.searchUsers(query);
      });

      expect(friendsService.searchUsers).toHaveBeenCalledWith(query);
      expect(result.current.searchResults).toEqual(mockResults);
    });
  });

  describe('clearSearchResults', () => {
    it('should clear search results', () => {
      const { result } = renderHook(() => useFriendsStore());

      act(() => {
        useFriendsStore.setState({
          searchResults: [{ id: 'user1' }] as any,
        });
      });

      expect(result.current.searchResults).toHaveLength(1);

      act(() => {
        result.current.clearSearchResults();
      });

      expect(result.current.searchResults).toHaveLength(0);
    });
  });
});
