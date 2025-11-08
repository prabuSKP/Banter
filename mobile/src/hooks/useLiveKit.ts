// mobile/src/hooks/useLiveKit.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RemoteParticipant,
  Participant,
  Track,
  TrackPublication,
  ConnectionState,
  DisconnectReason,
} from '@livekit/react-native';
import liveKitService, {
  LiveKitError,
  LiveKitErrorType,
  ParticipantInfo,
  LiveKitEventCallbacks,
} from '../services/livekit';

/**
 * Hook Configuration Options
 */
export interface UseLiveKitOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** LiveKit server URL */
  url?: string;
  /** Authentication token */
  token?: string;
  /** Room name (optional) */
  roomName?: string;
  /** Auto-subscribe to remote tracks */
  autoSubscribe?: boolean;
  /** Event callbacks */
  callbacks?: LiveKitEventCallbacks;
}

/**
 * Hook Return Type
 */
export interface UseLiveKitReturn {
  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  connectionState: ConnectionState | null;
  error: LiveKitError | null;

  // Room and participants
  room: Room | null;
  localParticipant: ParticipantInfo | null;
  remoteParticipants: ParticipantInfo[];
  allParticipants: ParticipantInfo[];

  // Track states
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;

  // Actions
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  switchCamera: () => Promise<void>;
  setMicrophoneEnabled: (enabled: boolean) => Promise<void>;
  setCameraEnabled: (enabled: boolean) => Promise<void>;
}

/**
 * Production-grade LiveKit React Hook
 *
 * Features:
 * - Automatic connection/disconnection lifecycle
 * - Real-time participant tracking
 * - Audio/video control
 * - Error handling and recovery
 * - Memory leak prevention
 * - Type-safe API
 * - Event callbacks
 *
 * @param options - Hook configuration options
 * @returns LiveKit state and control methods
 *
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   toggleMicrophone,
 *   toggleCamera,
 *   remoteParticipants,
 * } = useLiveKit({
 *   autoConnect: true,
 *   url: 'wss://my-livekit-server.com',
 *   token: 'my-auth-token',
 *   callbacks: {
 *     onParticipantConnected: (participant) => {
 *       console.log('Participant joined:', participant.identity);
 *     },
 *   },
 * });
 * ```
 */
export function useLiveKit(options: UseLiveKitOptions = {}): UseLiveKitReturn {
  const {
    autoConnect = false,
    url: initialUrl,
    token: initialToken,
    roomName,
    autoSubscribe = true,
    callbacks,
  } = options;

  // State management
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [error, setError] = useState<LiveKitError | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [localParticipant, setLocalParticipant] = useState<ParticipantInfo | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<ParticipantInfo[]>([]);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  // Refs for cleanup and preventing stale closures
  const isMountedRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  /**
   * Update local participant state
   */
  const updateLocalParticipantState = useCallback(() => {
    if (!isMountedRef.current) return;

    const localPart = liveKitService.getLocalParticipant();
    if (localPart) {
      const audioTrack = localPart.getTrackPublication(Track.Source.Microphone);
      const videoTrack = localPart.getTrackPublication(Track.Source.Camera);

      const participantInfo: ParticipantInfo = {
        identity: localPart.identity,
        sid: localPart.sid,
        name: localPart.name,
        isSpeaking: localPart.isSpeaking,
        isCameraEnabled: videoTrack?.isMuted === false,
        isMicrophoneEnabled: audioTrack?.isMuted === false,
        connectionQuality: localPart.connectionQuality?.toString() ?? 'unknown',
      };

      setLocalParticipant(participantInfo);
      setIsMicrophoneEnabled(audioTrack?.isMuted === false);
      setIsCameraEnabled(videoTrack?.isMuted === false);
    } else {
      setLocalParticipant(null);
      setIsMicrophoneEnabled(false);
      setIsCameraEnabled(false);
    }
  }, []);

  /**
   * Update remote participants state
   */
  const updateRemoteParticipantsState = useCallback(() => {
    if (!isMountedRef.current) return;

    const remoteParts = liveKitService.getRemoteParticipants();
    const participantsInfo: ParticipantInfo[] = remoteParts.map((p) => {
      const audioTrack = p.getTrackPublication(Track.Source.Microphone);
      const videoTrack = p.getTrackPublication(Track.Source.Camera);

      return {
        identity: p.identity,
        sid: p.sid,
        name: p.name,
        isSpeaking: p.isSpeaking,
        isCameraEnabled: videoTrack?.isMuted === false,
        isMicrophoneEnabled: audioTrack?.isMuted === false,
        connectionQuality: p.connectionQuality?.toString() ?? 'unknown',
      };
    });

    setRemoteParticipants(participantsInfo);
  }, []);

  /**
   * Update all states from LiveKit service
   */
  const updateStates = useCallback(() => {
    if (!isMountedRef.current) return;

    const currentRoom = liveKitService.getRoom();
    const connected = liveKitService.isRoomConnected();
    const connState = liveKitService.getConnectionState();

    setRoom(currentRoom);
    setIsConnected(connected);
    setConnectionState(connState);

    updateLocalParticipantState();
    updateRemoteParticipantsState();
  }, [updateLocalParticipantState, updateRemoteParticipantsState]);

  /**
   * Connect to LiveKit room
   */
  const connect = useCallback(
    async (connectUrl: string, connectToken: string) => {
      if (isConnecting) {
        console.warn('[useLiveKit] Connection already in progress');
        return;
      }

      setIsConnecting(true);
      setError(null);

      try {
        await liveKitService.connect({
          url: connectUrl,
          token: connectToken,
          roomName,
          autoSubscribe,
        });

        if (isMountedRef.current) {
          updateStates();
          setIsConnecting(false);
        }
      } catch (err) {
        console.error('[useLiveKit] Connection failed:', err);
        if (isMountedRef.current) {
          setError(err as LiveKitError);
          setIsConnecting(false);
          setIsConnected(false);
        }
      }
    },
    [isConnecting, roomName, autoSubscribe, updateStates]
  );

  /**
   * Disconnect from LiveKit room
   */
  const disconnect = useCallback(async () => {
    try {
      await liveKitService.disconnect();

      if (isMountedRef.current) {
        setIsConnected(false);
        setIsConnecting(false);
        setRoom(null);
        setLocalParticipant(null);
        setRemoteParticipants([]);
        setIsMicrophoneEnabled(false);
        setIsCameraEnabled(false);
        setConnectionState(null);
        setError(null);
      }
    } catch (err) {
      console.error('[useLiveKit] Disconnect failed:', err);
      if (isMountedRef.current) {
        setError(err as LiveKitError);
      }
    }
  }, []);

  /**
   * Toggle microphone on/off
   */
  const toggleMicrophone = useCallback(async () => {
    try {
      const newState = !isMicrophoneEnabled;
      await liveKitService.setMicrophoneEnabled(newState);

      if (isMountedRef.current) {
        setIsMicrophoneEnabled(newState);
        updateLocalParticipantState();
      }
    } catch (err) {
      console.error('[useLiveKit] Toggle microphone failed:', err);
      if (isMountedRef.current) {
        setError(err as LiveKitError);
      }
      throw err;
    }
  }, [isMicrophoneEnabled, updateLocalParticipantState]);

  /**
   * Toggle camera on/off
   */
  const toggleCamera = useCallback(async () => {
    try {
      const newState = !isCameraEnabled;
      await liveKitService.setCameraEnabled(newState);

      if (isMountedRef.current) {
        setIsCameraEnabled(newState);
        updateLocalParticipantState();
      }
    } catch (err) {
      console.error('[useLiveKit] Toggle camera failed:', err);
      if (isMountedRef.current) {
        setError(err as LiveKitError);
      }
      throw err;
    }
  }, [isCameraEnabled, updateLocalParticipantState]);

  /**
   * Switch between front and back camera
   */
  const switchCamera = useCallback(async () => {
    try {
      await liveKitService.switchCamera();
      // No state change needed, camera just flips
    } catch (err) {
      console.error('[useLiveKit] Switch camera failed:', err);
      if (isMountedRef.current) {
        setError(err as LiveKitError);
      }
      throw err;
    }
  }, []);

  /**
   * Set microphone enabled state
   */
  const setMicrophoneEnabledAction = useCallback(
    async (enabled: boolean) => {
      try {
        await liveKitService.setMicrophoneEnabled(enabled);

        if (isMountedRef.current) {
          setIsMicrophoneEnabled(enabled);
          updateLocalParticipantState();
        }
      } catch (err) {
        console.error('[useLiveKit] Set microphone enabled failed:', err);
        if (isMountedRef.current) {
          setError(err as LiveKitError);
        }
        throw err;
      }
    },
    [updateLocalParticipantState]
  );

  /**
   * Set camera enabled state
   */
  const setCameraEnabledAction = useCallback(
    async (enabled: boolean) => {
      try {
        await liveKitService.setCameraEnabled(enabled);

        if (isMountedRef.current) {
          setIsCameraEnabled(enabled);
          updateLocalParticipantState();
        }
      } catch (err) {
        console.error('[useLiveKit] Set camera enabled failed:', err);
        if (isMountedRef.current) {
          setError(err as LiveKitError);
        }
        throw err;
      }
    },
    [updateLocalParticipantState]
  );

  /**
   * Setup event callbacks
   */
  useEffect(() => {
    const eventCallbacks: LiveKitEventCallbacks = {
      onConnected: () => {
        console.log('[useLiveKit] Connected to room');
        updateStates();
        callbacksRef.current?.onConnected?.();
      },

      onDisconnected: (reason?: DisconnectReason) => {
        console.log('[useLiveKit] Disconnected from room:', reason);
        if (isMountedRef.current) {
          setIsConnected(false);
          setRoom(null);
          setLocalParticipant(null);
          setRemoteParticipants([]);
          setConnectionState(null);
        }
        callbacksRef.current?.onDisconnected?.(reason);
      },

      onReconnecting: () => {
        console.log('[useLiveKit] Reconnecting...');
        if (isMountedRef.current) {
          setConnectionState(ConnectionState.Reconnecting);
        }
        callbacksRef.current?.onReconnecting?.();
      },

      onReconnected: () => {
        console.log('[useLiveKit] Reconnected');
        updateStates();
        callbacksRef.current?.onReconnected?.();
      },

      onParticipantConnected: (participant: RemoteParticipant) => {
        console.log('[useLiveKit] Participant connected:', participant.identity);
        updateRemoteParticipantsState();
        callbacksRef.current?.onParticipantConnected?.(participant);
      },

      onParticipantDisconnected: (participant: RemoteParticipant) => {
        console.log('[useLiveKit] Participant disconnected:', participant.identity);
        updateRemoteParticipantsState();
        callbacksRef.current?.onParticipantDisconnected?.(participant);
      },

      onActiveSpeakersChanged: (speakers: Participant[]) => {
        console.log('[useLiveKit] Active speakers changed:', speakers.length);
        // Update both local and remote participants as speaking state changed
        updateLocalParticipantState();
        updateRemoteParticipantsState();
        callbacksRef.current?.onActiveSpeakersChanged?.(speakers);
      },

      onTrackSubscribed: (track, publication, participant) => {
        console.log(
          '[useLiveKit] Track subscribed:',
          track.kind,
          'from',
          participant.identity
        );
        updateRemoteParticipantsState();
        callbacksRef.current?.onTrackSubscribed?.(track, publication, participant);
      },

      onTrackUnsubscribed: (track, publication, participant) => {
        console.log(
          '[useLiveKit] Track unsubscribed:',
          track.kind,
          'from',
          participant.identity
        );
        updateRemoteParticipantsState();
        callbacksRef.current?.onTrackUnsubscribed?.(track, publication, participant);
      },

      onConnectionQualityChanged: (quality, participant) => {
        console.log('[useLiveKit] Connection quality changed:', quality);
        // Update participant info to reflect new quality
        updateLocalParticipantState();
        updateRemoteParticipantsState();
        callbacksRef.current?.onConnectionQualityChanged?.(quality, participant);
      },

      onError: (err: LiveKitError) => {
        console.error('[useLiveKit] LiveKit error:', err.type, err.message);
        if (isMountedRef.current) {
          setError(err);
        }
        callbacksRef.current?.onError?.(err);
      },
    };

    liveKitService.setEventCallbacks(eventCallbacks);

    return () => {
      // Don't clear callbacks on unmount as the service is a singleton
      // But we do check isMountedRef before setting state
    };
  }, [
    updateStates,
    updateLocalParticipantState,
    updateRemoteParticipantsState,
  ]);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect && initialUrl && initialToken) {
      console.log('[useLiveKit] Auto-connecting to room...');
      connect(initialUrl, initialToken);
    }
  }, [autoConnect, initialUrl, initialToken, connect]);

  /**
   * Poll for state updates (to catch changes not triggered by events)
   */
  useEffect(() => {
    if (isConnected) {
      // Poll every 1 second to ensure state is in sync
      pollIntervalRef.current = setInterval(() => {
        updateStates();
      }, 1000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isConnected, updateStates]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[useLiveKit] Component unmounting, cleaning up...');
      isMountedRef.current = false;

      // Clear polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Disconnect on unmount
      liveKitService.disconnect().catch((err) => {
        console.error('[useLiveKit] Error during unmount disconnect:', err);
      });
    };
  }, []);

  // Compute all participants (local + remote)
  const allParticipants = localParticipant
    ? [localParticipant, ...remoteParticipants]
    : remoteParticipants;

  return {
    // Connection state
    isConnecting,
    isConnected,
    connectionState,
    error,

    // Room and participants
    room,
    localParticipant,
    remoteParticipants,
    allParticipants,

    // Track states
    isMicrophoneEnabled,
    isCameraEnabled,

    // Actions
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    setMicrophoneEnabled: setMicrophoneEnabledAction,
    setCameraEnabled: setCameraEnabledAction,
  };
}

export default useLiveKit;
