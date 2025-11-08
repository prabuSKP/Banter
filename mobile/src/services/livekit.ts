// mobile/src/services/livekit.ts

import {
  Room,
  RoomEvent,
  Track,
  Participant,
  RemoteParticipant,
  LocalParticipant,
  RoomOptions,
  VideoPresets,
  TrackPublication,
  LocalVideoTrack,
  LocalAudioTrack,
  ConnectionState,
  DisconnectReason,
  ParticipantEvent,
} from '@livekit/react-native';

/**
 * LiveKit Service Configuration
 */
interface LiveKitConfig {
  adaptiveStream: boolean;
  dynacast: boolean;
  videoCaptureDefaults: {
    resolution: VideoPresets;
  };
}

/**
 * Connection Options
 */
interface ConnectOptions {
  url: string;
  token: string;
  roomName?: string;
  autoSubscribe?: boolean;
}

/**
 * Participant Info
 */
export interface ParticipantInfo {
  identity: string;
  sid: string;
  name?: string;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  connectionQuality: string;
}

/**
 * LiveKit Error Types
 */
export enum LiveKitErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  DISCONNECTED = 'DISCONNECTED',
  MICROPHONE_ERROR = 'MICROPHONE_ERROR',
  CAMERA_ERROR = 'CAMERA_ERROR',
  TRACK_ERROR = 'TRACK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom LiveKit Error
 */
export class LiveKitError extends Error {
  type: LiveKitErrorType;
  originalError?: Error;

  constructor(type: LiveKitErrorType, message: string, originalError?: Error) {
    super(message);
    this.name = 'LiveKitError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Event Callbacks
 */
export interface LiveKitEventCallbacks {
  onConnected?: () => void;
  onDisconnected?: (reason?: DisconnectReason) => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onParticipantConnected?: (participant: RemoteParticipant) => void;
  onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  onActiveSpeakersChanged?: (speakers: Participant[]) => void;
  onTrackSubscribed?: (
    track: Track,
    publication: TrackPublication,
    participant: RemoteParticipant
  ) => void;
  onTrackUnsubscribed?: (
    track: Track,
    publication: TrackPublication,
    participant: RemoteParticipant
  ) => void;
  onConnectionQualityChanged?: (quality: string, participant: Participant) => void;
  onError?: (error: LiveKitError) => void;
}

/**
 * Production-grade LiveKit Service for React Native
 *
 * Features:
 * - Comprehensive error handling with user-friendly messages
 * - Automatic reconnection on network issues
 * - Memory leak prevention with proper cleanup
 * - Audio/video track management
 * - Participant event handling
 * - Connection state management
 * - Mobile optimization (battery, memory, network)
 */
class LiveKitService {
  private room: Room | null = null;
  private isConnecting = false;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private eventCallbacks: LiveKitEventCallbacks = {};
  private cleanupFunctions: Array<() => void> = [];

  // Default configuration optimized for mobile
  private defaultConfig: LiveKitConfig = {
    adaptiveStream: true, // Adapt to network conditions
    dynacast: true, // Dynamic broadcast for better bandwidth usage
    videoCaptureDefaults: {
      resolution: VideoPresets.h540, // Balanced quality for mobile
    },
  };

  /**
   * Connect to a LiveKit room
   *
   * @param options - Connection options including URL and token
   * @returns Promise that resolves when connected
   * @throws LiveKitError on connection failure
   */
  async connect(options: ConnectOptions): Promise<Room> {
    const { url, token, autoSubscribe = true } = options;

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.warn('[LiveKit] Connection already in progress');
      throw new LiveKitError(
        LiveKitErrorType.CONNECTION_FAILED,
        'Connection already in progress'
      );
    }

    // Disconnect existing room if any
    if (this.room) {
      console.log('[LiveKit] Disconnecting existing room before new connection');
      await this.disconnect();
    }

    this.isConnecting = true;

    try {
      console.log('[LiveKit] Initiating connection to room...');
      console.log(`[LiveKit] URL: ${url}`);

      // Create room instance with mobile-optimized options
      this.room = new Room({
        adaptiveStream: this.defaultConfig.adaptiveStream,
        dynacast: this.defaultConfig.dynacast,
        videoCaptureDefaults: this.defaultConfig.videoCaptureDefaults,
        // Auto-subscribe to remote tracks
        autoSubscribe,
      } as RoomOptions);

      // Setup event listeners before connecting
      this.setupEventListeners(this.room);

      // Connect to the room
      await this.room.connect(url, token);

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      console.log('[LiveKit] Successfully connected to room');
      console.log(`[LiveKit] Room name: ${this.room.name}`);
      console.log(`[LiveKit] Local participant: ${this.room.localParticipant?.identity}`);

      // Trigger connected callback
      this.eventCallbacks.onConnected?.();

      return this.room;
    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;

      const errorMessage = this.getErrorMessage(error);
      console.error('[LiveKit] Connection failed:', errorMessage);

      const liveKitError = new LiveKitError(
        LiveKitErrorType.CONNECTION_FAILED,
        `Failed to connect to room: ${errorMessage}`,
        error as Error
      );

      this.eventCallbacks.onError?.(liveKitError);
      throw liveKitError;
    }
  }

  /**
   * Disconnect from the room and cleanup resources
   */
  async disconnect(): Promise<void> {
    console.log('[LiveKit] Disconnecting from room...');

    try {
      // Run all cleanup functions
      this.cleanupFunctions.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error('[LiveKit] Error during cleanup:', error);
        }
      });
      this.cleanupFunctions = [];

      // Disconnect room
      if (this.room) {
        await this.room.disconnect();
        this.room = null;
      }

      this.isConnected = false;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      console.log('[LiveKit] Successfully disconnected');
    } catch (error) {
      console.error('[LiveKit] Error during disconnect:', error);
      // Reset state even if disconnect fails
      this.room = null;
      this.isConnected = false;
      this.isConnecting = false;
    }
  }

  /**
   * Enable or disable microphone
   *
   * @param enabled - True to enable, false to disable
   * @throws LiveKitError on microphone operation failure
   */
  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.room) {
      throw new LiveKitError(
        LiveKitErrorType.MICROPHONE_ERROR,
        'Cannot control microphone: Not connected to room'
      );
    }

    try {
      console.log(`[LiveKit] ${enabled ? 'Enabling' : 'Disabling'} microphone...`);
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
      console.log(`[LiveKit] Microphone ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      console.error('[LiveKit] Microphone control error:', errorMessage);

      throw new LiveKitError(
        LiveKitErrorType.MICROPHONE_ERROR,
        `Failed to ${enabled ? 'enable' : 'disable'} microphone: ${errorMessage}`,
        error as Error
      );
    }
  }

  /**
   * Enable or disable camera
   *
   * @param enabled - True to enable, false to disable
   * @throws LiveKitError on camera operation failure
   */
  async setCameraEnabled(enabled: boolean): Promise<void> {
    if (!this.room) {
      throw new LiveKitError(
        LiveKitErrorType.CAMERA_ERROR,
        'Cannot control camera: Not connected to room'
      );
    }

    try {
      console.log(`[LiveKit] ${enabled ? 'Enabling' : 'Disabling'} camera...`);
      await this.room.localParticipant.setCameraEnabled(enabled);
      console.log(`[LiveKit] Camera ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      console.error('[LiveKit] Camera control error:', errorMessage);

      // Check if it's a permission error
      if (errorMessage.toLowerCase().includes('permission')) {
        throw new LiveKitError(
          LiveKitErrorType.PERMISSION_DENIED,
          'Camera permission denied. Please enable camera access in settings.',
          error as Error
        );
      }

      throw new LiveKitError(
        LiveKitErrorType.CAMERA_ERROR,
        `Failed to ${enabled ? 'enable' : 'disable'} camera: ${errorMessage}`,
        error as Error
      );
    }
  }

  /**
   * Switch between front and back camera
   *
   * @throws LiveKitError on camera switch failure
   */
  async switchCamera(): Promise<void> {
    if (!this.room) {
      throw new LiveKitError(
        LiveKitErrorType.CAMERA_ERROR,
        'Cannot switch camera: Not connected to room'
      );
    }

    try {
      console.log('[LiveKit] Switching camera...');

      // Get the camera track
      const videoTrack = this.room.localParticipant.getTrackPublication(
        Track.Source.Camera
      );

      if (!videoTrack?.track) {
        throw new LiveKitError(
          LiveKitErrorType.CAMERA_ERROR,
          'No active camera track found'
        );
      }

      // Switch camera (cast to LocalVideoTrack for mobile-specific methods)
      const localVideoTrack = videoTrack.track as LocalVideoTrack;

      if (typeof localVideoTrack.switchCamera === 'function') {
        await localVideoTrack.switchCamera();
        console.log('[LiveKit] Camera switched successfully');
      } else {
        throw new LiveKitError(
          LiveKitErrorType.CAMERA_ERROR,
          'Camera switching not supported on this platform'
        );
      }
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      console.error('[LiveKit] Camera switch error:', errorMessage);

      if (error instanceof LiveKitError) {
        throw error;
      }

      throw new LiveKitError(
        LiveKitErrorType.CAMERA_ERROR,
        `Failed to switch camera: ${errorMessage}`,
        error as Error
      );
    }
  }

  /**
   * Get current room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Get local participant
   */
  getLocalParticipant(): LocalParticipant | undefined {
    return this.room?.localParticipant;
  }

  /**
   * Get all remote participants
   */
  getRemoteParticipants(): RemoteParticipant[] {
    if (!this.room) return [];
    return Array.from(this.room.remoteParticipants.values());
  }

  /**
   * Get participant info by identity
   */
  getParticipantInfo(identity: string): ParticipantInfo | null {
    if (!this.room) return null;

    // Check local participant
    if (this.room.localParticipant?.identity === identity) {
      return this.createParticipantInfo(this.room.localParticipant);
    }

    // Check remote participants
    const remoteParticipant = Array.from(this.room.remoteParticipants.values()).find(
      (p) => p.identity === identity
    );

    return remoteParticipant ? this.createParticipantInfo(remoteParticipant) : null;
  }

  /**
   * Check if microphone is enabled
   */
  isMicrophoneEnabled(): boolean {
    if (!this.room) return false;
    const audioTrack = this.room.localParticipant?.getTrackPublication(
      Track.Source.Microphone
    );
    return audioTrack?.isMuted === false;
  }

  /**
   * Check if camera is enabled
   */
  isCameraEnabled(): boolean {
    if (!this.room) return false;
    const videoTrack = this.room.localParticipant?.getTrackPublication(
      Track.Source.Camera
    );
    return videoTrack?.isMuted === false;
  }

  /**
   * Check connection status
   */
  isRoomConnected(): boolean {
    return this.isConnected && this.room?.state === ConnectionState.Connected;
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState | null {
    return this.room?.state ?? null;
  }

  /**
   * Register event callbacks
   */
  setEventCallbacks(callbacks: LiveKitEventCallbacks): void {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks };
  }

  /**
   * Clear all event callbacks
   */
  clearEventCallbacks(): void {
    this.eventCallbacks = {};
  }

  /**
   * Setup event listeners for the room
   */
  private setupEventListeners(room: Room): void {
    console.log('[LiveKit] Setting up event listeners...');

    // Connection state changed
    const onConnectionStateChanged = (state: ConnectionState) => {
      console.log(`[LiveKit] Connection state changed: ${state}`);

      if (state === ConnectionState.Reconnecting) {
        this.eventCallbacks.onReconnecting?.();
      } else if (state === ConnectionState.Connected) {
        if (this.reconnectAttempts > 0) {
          console.log('[LiveKit] Reconnected successfully');
          this.reconnectAttempts = 0;
          this.eventCallbacks.onReconnected?.();
        }
      }
    };

    room.on(RoomEvent.ConnectionStateChanged, onConnectionStateChanged);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.ConnectionStateChanged, onConnectionStateChanged)
    );

    // Room disconnected
    const onDisconnected = (reason?: DisconnectReason) => {
      console.log(`[LiveKit] Room disconnected, reason: ${reason}`);
      this.isConnected = false;

      // Attempt reconnection on unexpected disconnect
      if (reason && this.shouldReconnect(reason)) {
        this.handleReconnection();
      }

      this.eventCallbacks.onDisconnected?.(reason);
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    this.cleanupFunctions.push(() => room.off(RoomEvent.Disconnected, onDisconnected));

    // Participant connected
    const onParticipantConnected = (participant: RemoteParticipant) => {
      console.log(`[LiveKit] Participant connected: ${participant.identity}`);
      this.eventCallbacks.onParticipantConnected?.(participant);
    };

    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected)
    );

    // Participant disconnected
    const onParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log(`[LiveKit] Participant disconnected: ${participant.identity}`);
      this.eventCallbacks.onParticipantDisconnected?.(participant);
    };

    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
    );

    // Active speakers changed
    const onActiveSpeakersChanged = (speakers: Participant[]) => {
      console.log(`[LiveKit] Active speakers changed: ${speakers.length} speakers`);
      this.eventCallbacks.onActiveSpeakersChanged?.(speakers);
    };

    room.on(RoomEvent.ActiveSpeakersChanged, onActiveSpeakersChanged);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.ActiveSpeakersChanged, onActiveSpeakersChanged)
    );

    // Track subscribed
    const onTrackSubscribed = (
      track: Track,
      publication: TrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log(
        `[LiveKit] Track subscribed: ${track.kind} from ${participant.identity}`
      );
      this.eventCallbacks.onTrackSubscribed?.(track, publication, participant);
    };

    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed)
    );

    // Track unsubscribed
    const onTrackUnsubscribed = (
      track: Track,
      publication: TrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log(
        `[LiveKit] Track unsubscribed: ${track.kind} from ${participant.identity}`
      );
      this.eventCallbacks.onTrackUnsubscribed?.(track, publication, participant);
    };

    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
    );

    // Connection quality changed
    const onConnectionQualityChanged = (quality: string, participant: Participant) => {
      console.log(`[LiveKit] Connection quality for ${participant.identity}: ${quality}`);
      this.eventCallbacks.onConnectionQualityChanged?.(quality, participant);
    };

    room.on(RoomEvent.ConnectionQualityChanged, onConnectionQualityChanged);
    this.cleanupFunctions.push(() =>
      room.off(RoomEvent.ConnectionQualityChanged, onConnectionQualityChanged)
    );

    console.log('[LiveKit] Event listeners setup complete');
  }

  /**
   * Handle automatic reconnection
   */
  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[LiveKit] Max reconnection attempts (${this.maxReconnectAttempts}) reached`
      );
      const error = new LiveKitError(
        LiveKitErrorType.CONNECTION_FAILED,
        'Failed to reconnect after maximum attempts'
      );
      this.eventCallbacks.onError?.(error);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(
      `[LiveKit] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.room) {
        console.log('[LiveKit] Attempting to reconnect...');
        // LiveKit SDK handles reconnection automatically
        // This is just for logging and callback purposes
      }
    }, delay);
  }

  /**
   * Determine if should attempt reconnection based on disconnect reason
   */
  private shouldReconnect(reason: DisconnectReason): boolean {
    // Don't reconnect on intentional disconnects or duplicates
    const noReconnectReasons = [
      DisconnectReason.CLIENT_INITIATED,
      DisconnectReason.DUPLICATE_IDENTITY,
      DisconnectReason.SERVER_SHUTDOWN,
      DisconnectReason.PARTICIPANT_REMOVED,
      DisconnectReason.ROOM_DELETED,
    ];

    return !noReconnectReasons.includes(reason);
  }

  /**
   * Create participant info object
   */
  private createParticipantInfo(participant: Participant): ParticipantInfo {
    const audioTrack = participant.getTrackPublication(Track.Source.Microphone);
    const videoTrack = participant.getTrackPublication(Track.Source.Camera);

    return {
      identity: participant.identity,
      sid: participant.sid,
      name: participant.name,
      isSpeaking: participant.isSpeaking,
      isCameraEnabled: videoTrack?.isMuted === false,
      isMicrophoneEnabled: audioTrack?.isMuted === false,
      connectionQuality: participant.connectionQuality?.toString() ?? 'unknown',
    };
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }
}

// Export singleton instance
export default new LiveKitService();
