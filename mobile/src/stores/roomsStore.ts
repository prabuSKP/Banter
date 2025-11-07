// mobile/src/stores/roomsStore.ts

import { create } from 'zustand';
import roomsService, { Room, RoomMember, CreateRoomData, UpdateRoomData } from '../services/rooms';
import socketService from '../services/socket';

interface RoomsState {
  publicRooms: Room[];
  myRooms: Room[];
  activeRoom: Room | null;
  roomMembers: RoomMember[];
  searchResults: Room[];
  agoraToken: any | null;
  isInRoom: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  speakingUsers: Set<string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPublicRooms: (page?: number) => Promise<void>;
  fetchMyRooms: () => Promise<void>;
  searchRooms: (query: string, page?: number) => Promise<void>;
  getRoomById: (roomId: string) => Promise<void>;
  createRoom: (data: CreateRoomData) => Promise<Room>;
  updateRoom: (roomId: string, data: UpdateRoomData) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  fetchRoomMembers: (roomId: string) => Promise<void>;
  getAgoraTokenForRoom: (roomId: string) => Promise<void>;
  toggleMute: () => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setUserSpeaking: (userId: string, isSpeaking: boolean) => void;
  clearSearchResults: () => void;
  clearError: () => void;
  initializeSocketListeners: () => void;
  cleanupSocketListeners: () => void;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
  publicRooms: [],
  myRooms: [],
  activeRoom: null,
  roomMembers: [],
  searchResults: [],
  agoraToken: null,
  isInRoom: false,
  isSpeaking: false,
  isMuted: false,
  speakingUsers: new Set(),
  isLoading: false,
  error: null,

  fetchPublicRooms: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { rooms } = await roomsService.getPublicRooms(page);

      set(state => ({
        publicRooms: page === 1 ? rooms : [...state.publicRooms, ...rooms],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch public rooms',
        isLoading: false,
      });
    }
  },

  fetchMyRooms: async () => {
    try {
      set({ isLoading: true, error: null });
      const rooms = await roomsService.getMyRooms();
      set({ myRooms: rooms, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch your rooms',
        isLoading: false,
      });
    }
  },

  searchRooms: async (query: string, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const { rooms } = await roomsService.searchRooms(query, page);

      set(state => ({
        searchResults: page === 1 ? rooms : [...state.searchResults, ...rooms],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Search failed',
        isLoading: false,
      });
    }
  },

  getRoomById: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });
      const room = await roomsService.getRoomById(roomId);
      set({ activeRoom: room, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch room',
        isLoading: false,
      });
    }
  },

  createRoom: async (data: CreateRoomData) => {
    try {
      set({ isLoading: true, error: null });
      const room = await roomsService.createRoom(data);

      // Add to my rooms
      set(state => ({
        myRooms: [room, ...state.myRooms],
        isLoading: false,
      }));

      return room;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create room',
        isLoading: false,
      });
      throw error;
    }
  },

  updateRoom: async (roomId: string, data: UpdateRoomData) => {
    try {
      set({ isLoading: true, error: null });
      const updatedRoom = await roomsService.updateRoom(roomId, data);

      // Update in my rooms
      set(state => ({
        myRooms: state.myRooms.map(room =>
          room.id === roomId ? updatedRoom : room
        ),
        activeRoom: state.activeRoom?.id === roomId ? updatedRoom : state.activeRoom,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update room',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteRoom: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });
      await roomsService.deleteRoom(roomId);

      // Remove from my rooms
      set(state => ({
        myRooms: state.myRooms.filter(room => room.id !== roomId),
        activeRoom: state.activeRoom?.id === roomId ? null : state.activeRoom,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete room',
        isLoading: false,
      });
      throw error;
    }
  },

  joinRoom: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Join the room
      await roomsService.joinRoom(roomId);

      // Get room details
      const room = await roomsService.getRoomById(roomId);

      // Get Agora token
      const tokenData = await roomsService.getAgoraToken(roomId);

      set({
        activeRoom: room,
        agoraToken: tokenData,
        isInRoom: true,
        isLoading: false,
      });

      // Emit socket event
      if (socketService.connected) {
        socketService.emit('room:join', { roomId });
      }

      // Fetch room members
      await get().fetchRoomMembers(roomId);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to join room',
        isLoading: false,
      });
      throw error;
    }
  },

  leaveRoom: async () => {
    const { activeRoom } = get();
    if (!activeRoom) return;

    try {
      set({ isLoading: true, error: null });

      // Leave the room
      await roomsService.leaveRoom(activeRoom.id);

      // Emit socket event
      if (socketService.connected) {
        socketService.emit('room:leave', { roomId: activeRoom.id });
      }

      set({
        activeRoom: null,
        roomMembers: [],
        agoraToken: null,
        isInRoom: false,
        isSpeaking: false,
        isMuted: false,
        speakingUsers: new Set(),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to leave room',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchRoomMembers: async (roomId: string) => {
    try {
      const members = await roomsService.getRoomMembers(roomId);
      set({ roomMembers: members });
    } catch (error: any) {
      console.error('Failed to fetch room members:', error);
    }
  },

  getAgoraTokenForRoom: async (roomId: string) => {
    try {
      const tokenData = await roomsService.getAgoraToken(roomId);
      set({ agoraToken: tokenData });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to get Agora token',
      });
      throw error;
    }
  },

  toggleMute: () => {
    const newMuteState = !get().isMuted;
    set({ isMuted: newMuteState });

    // If muting, stop speaking
    if (newMuteState) {
      get().setSpeaking(false);
    }
  },

  setSpeaking: (isSpeaking: boolean) => {
    const { activeRoom, isMuted } = get();

    // Can't speak if muted
    if (isMuted && isSpeaking) return;

    set({ isSpeaking });

    // Emit socket event
    if (activeRoom && socketService.connected) {
      socketService.emit('room:speaking', {
        roomId: activeRoom.id,
        isSpeaking,
      });
    }
  },

  setUserSpeaking: (userId: string, isSpeaking: boolean) => {
    set(state => {
      const newSpeakingUsers = new Set(state.speakingUsers);
      if (isSpeaking) {
        newSpeakingUsers.add(userId);
      } else {
        newSpeakingUsers.delete(userId);
      }
      return { speakingUsers: newSpeakingUsers };
    });
  },

  clearSearchResults: () => set({ searchResults: [] }),

  clearError: () => set({ error: null }),

  initializeSocketListeners: () => {
    // Listen for user joined room
    socketService.on('room:user_joined', (data: { userId: string; roomId: string }) => {
      const { activeRoom } = get();
      if (activeRoom?.id === data.roomId) {
        // Refresh room members
        get().fetchRoomMembers(data.roomId);
      }
    });

    // Listen for user left room
    socketService.on('room:user_left', (data: { userId: string; roomId: string }) => {
      const { activeRoom } = get();
      if (activeRoom?.id === data.roomId) {
        // Remove user from speaking users
        get().setUserSpeaking(data.userId, false);
        // Refresh room members
        get().fetchRoomMembers(data.roomId);
      }
    });

    // Listen for user speaking
    socketService.on('room:user_speaking', (data: { userId: string; roomId: string; isSpeaking: boolean }) => {
      const { activeRoom } = get();
      if (activeRoom?.id === data.roomId) {
        get().setUserSpeaking(data.userId, data.isSpeaking);
      }
    });
  },

  cleanupSocketListeners: () => {
    socketService.off('room:user_joined');
    socketService.off('room:user_left');
    socketService.off('room:user_speaking');
  },
}));
