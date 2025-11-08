# Mobile App LiveKit Migration Guide

## Overview

Complete guide for migrating the Banter mobile app from Agora.io to LiveKit WebRTC.

---

## ✅ Backend Migration (COMPLETED)

The backend has been fully migrated to LiveKit:
- ✅ LiveKit service created with JWT token generation
- ✅ COTURN configuration for TURN/STUN servers
- ✅ Database schema updated (livekitRoomName)
- ✅ Call and room services updated
- ✅ Socket.IO events updated for LiveKit
- ✅ All Agora references removed

---

## 📱 Mobile Migration Steps

### Step 1: Update Dependencies

**Remove Agora packages:**
```bash
cd mobile
npm uninstall react-native-agora agora-react-native-rtm
```

**Install LiveKit packages:**
```bash
npm install @livekit/react-native@^2.5.3
npm install @livekit/react-native-webrtc@^125.0.4
npm install
```

**Package.json changes:**
```diff
- "agora-react-native-rtm": "^2.2.6",
- "react-native-agora": "^4.5.3",
+ "@livekit/react-native": "^2.5.3",
+ "@livekit/react-native-webrtc": "^125.0.4",
```

---

### Step 2: Update Permissions (iOS/Android)

**iOS - Info.plist:**
```xml
<key>NSCameraUsageDescription</key>
<string>Banter needs camera access for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>Banter needs microphone access for voice calls</string>
```

**Android - AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

### Step 3: Create LiveKit Service Layer

**File: `mobile/src/services/livekit.ts`**

```typescript
import { Room, RoomEvent, Track, Participant } from '@livekit/react-native';
import { logger } from './logger';

class LiveKitService {
  private room: Room | null = null;

  /**
   * Connect to LiveKit room
   */
  async connect(url: string, token: string): Promise<Room> {
    try {
      this.room = new Room();

      // Setup event listeners
      this.setupEventListeners(this.room);

      // Connect to room
      await this.room.connect(url, token);

      logger.info('Connected to LiveKit room');
      return this.room;
    } catch (error) {
      logger.error('LiveKit connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from room
   */
  async disconnect() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      logger.info('Disconnected from LiveKit room');
    }
  }

  /**
   * Enable/disable microphone
   */
  async setMicrophoneEnabled(enabled: boolean) {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  /**
   * Enable/disable camera
   */
  async setCameraEnabled(enabled: boolean) {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(enabled);
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    if (this.room) {
      const videoTrack = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (videoTrack?.track) {
        await videoTrack.track.switchCamera();
      }
    }
  }

  private setupEventListeners(room: Room) {
    // Participant connected
    room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      logger.info('Participant connected:', participant.identity);
    });

    // Participant disconnected
    room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
      logger.info('Participant disconnected:', participant.identity);
    });

    // Room disconnected
    room.on(RoomEvent.Disconnected, () => {
      logger.info('Room disconnected');
    });

    // Connection state changed
    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      logger.info('Connection state:', state);
    });
  }
}

export default new LiveKitService();
```

---

### Step 4: Create useLiveKit Hook

**File: `mobile/src/hooks/useLiveKit.ts`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, Participant, Track } from '@livekit/react-native';
import livekitService from '../services/livekit';

interface UseLiveKitOptions {
  url: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participant: Participant) => void;
}

export const useLiveKit = (options: UseLiveKitOptions) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect to room
  const connect = useCallback(async () => {
    try {
      const connectedRoom = await livekitService.connect(options.url, options.token);
      setRoom(connectedRoom);
      setIsConnected(true);
      options.onConnected?.();
    } catch (err) {
      setError(err as Error);
    }
  }, [options]);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    await livekitService.disconnect();
    setRoom(null);
    setIsConnected(false);
    options.onDisconnected?.();
  }, [options]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    const newState = !isMicrophoneEnabled;
    await livekitService.setMicrophoneEnabled(newState);
    setIsMicrophoneEnabled(newState);
  }, [isMicrophoneEnabled]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    const newState = !isCameraEnabled;
    await livekitService.setCameraEnabled(newState);
    setIsCameraEnabled(newState);
  }, [isCameraEnabled]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    await livekitService.switchCamera();
  }, []);

  return {
    room,
    isConnected,
    participants,
    isMicrophoneEnabled,
    isCameraEnabled,
    error,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
  };
};
```

---

### Step 5: Update Call Screens

**Voice Call Screen Example:**

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useLiveKit } from '../hooks/useLiveKit';
import { useLocalSearchParams } from 'expo-router';

export default function VoiceCallScreen() {
  const params = useLocalSearchParams();
  const { livekitUrl, livekitToken, callId } = params;

  const {
    isConnected,
    isMicrophoneEnabled,
    connect,
    disconnect,
    toggleMicrophone,
  } = useLiveKit({
    url: livekitUrl as string,
    token: livekitToken as string,
    onConnected: () => console.log('Connected to call'),
    onDisconnected: () => console.log('Disconnected from call'),
  });

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Voice Call</Text>
      <Text>Status: {isConnected ? 'Connected' : 'Connecting...'}</Text>

      <Button
        mode="contained"
        onPress={toggleMicrophone}
        icon={isMicrophoneEnabled ? 'microphone' : 'microphone-off'}
      >
        {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
      </Button>

      <Button
        mode="contained"
        onPress={disconnect}
        icon="phone-hangup"
        buttonColor="red"
      >
        End Call
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
```

---

### Step 6: Update Socket.IO Events

**Update call initiation to use LiveKit:**

```typescript
// OLD (Agora)
socket.emit('call:initiate', {
  receiverId,
  callType: 'audio',
  agoraChannel: channelName,
  agoraToken: token,
});

// NEW (LiveKit)
socket.emit('call:initiate', {
  receiverId,
  callType: 'audio',
  livekitRoom: roomName,
  livekitToken: token,
  callId: callId,
});
```

---

### Step 7: Update State Management (Zustand)

**Update call store:**

```typescript
import { create } from 'zustand';

interface CallState {
  callId: string | null;
  livekitRoom: string | null;
  livekitToken: string | null;
  livekitUrl: string | null;
  // ... other state

  setCallData: (data: {
    callId: string;
    livekitRoom: string;
    livekitToken: string;
    livekitUrl: string;
  }) => void;
}

export const useCallStore = create<CallState>((set) => ({
  callId: null,
  livekitRoom: null,
  livekitToken: null,
  livekitUrl: null,

  setCallData: (data) => set(data),
}));
```

---

## 🔧 Testing Checklist

- [ ] Install new dependencies
- [ ] Remove old Agora files
- [ ] Test voice calls (1-on-1)
- [ ] Test video calls (1-on-1)
- [ ] Test call quality
- [ ] Test microphone mute/unmute
- [ ] Test camera on/off
- [ ] Test camera switching
- [ ] Test call ending
- [ ] Test reconnection on network issues
- [ ] Test on iOS device
- [ ] Test on Android device

---

## 🚀 Deployment Notes

**Before deploying:**
1. Test on physical devices (Expo Go)
2. Ensure backend is deployed with LiveKit support
3. Configure COTURN server for production
4. Test in production environment
5. Monitor call quality metrics

---

## 📚 References

- LiveKit React Native SDK: https://docs.livekit.io/client-sdk-js/react-native/
- LiveKit Server Setup: https://docs.livekit.io/deploy/
- COTURN Setup: https://github.com/coturn/coturn

---

## ⚠️ Breaking Changes

1. **Package Changes:**
   - Removed: `react-native-agora`, `agora-react-native-rtm`
   - Added: `@livekit/react-native`, `@livekit/react-native-webrtc`

2. **API Changes:**
   - Token format: Agora tokens → LiveKit JWT tokens
   - Room naming: Channel names → LiveKit room names
   - Participant IDs: Numeric UIDs → String identities

3. **Socket Events:**
   - `agoraChannel` → `livekitRoom`
   - `agoraToken` → `livekitToken`
   - Added `callId` field to events

4. **State Management:**
   - Update all stores using Agora fields
   - Replace with LiveKit equivalents
