// mobile/app/calls/incoming.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import {
  Text,
  Avatar,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useCallsStore } from '../../src/stores/callsStore';
import { Audio } from 'expo-av';

export default function IncomingCallScreen() {
  const theme = useTheme();
  const [sound, setSound] = useState<Audio.Sound>();

  const { incomingCall, acceptCall, rejectCall } = useCallsStore();

  useEffect(() => {
    if (!incomingCall) {
      // No incoming call, go back
      router.back();
      return;
    }

    playRingtone();
    startVibration();

    return () => {
      stopRingtone();
      stopVibration();
    };
  }, [incomingCall]);

  const playRingtone = async () => {
    try {
      const { sound: ringtone } = await Audio.Sound.createAsync(
        require('../../assets/sounds/incoming.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      setSound(ringtone);
    } catch (error) {
      console.log('Failed to load ringtone:', error);
    }
  };

  const stopRingtone = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };

  const startVibration = () => {
    // Vibrate in pattern: wait 500ms, vibrate 1000ms, repeat
    Vibration.vibrate([500, 1000], true);
  };

  const stopVibration = () => {
    Vibration.cancel();
  };

  const handleAccept = async () => {
    await stopRingtone();
    stopVibration();

    acceptCall();

    // Navigate to active call
    router.replace({
      pathname: '/calls/active',
      params: { callId: incomingCall?.callId },
    });
  };

  const handleReject = async () => {
    await stopRingtone();
    stopVibration();

    rejectCall();
    router.back();
  };

  if (!incomingCall) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* User Info */}
      <View style={styles.userSection}>
        <Avatar.Image
          size={120}
          source={
            incomingCall.caller.avatar
              ? { uri: incomingCall.caller.avatar }
              : require('../../assets/default-avatar.png')
          }
          style={styles.avatar}
        />

        <Text variant="headlineLarge" style={styles.userName}>
          {incomingCall.caller.fullName}
        </Text>

        <Text variant="bodyLarge" style={styles.username}>
          @{incomingCall.caller.username}
        </Text>

        <View style={styles.statusContainer}>
          <IconButton
            icon="phone-incoming"
            size={24}
            iconColor="white"
          />
          <Text variant="bodyLarge" style={styles.statusText}>
            Incoming {incomingCall.callType} call...
          </Text>
        </View>
      </View>

      {/* Call Type Indicator */}
      <View style={styles.callTypeContainer}>
        <IconButton
          icon={incomingCall.callType === 'video' ? 'video' : 'phone'}
          size={32}
          iconColor="white"
        />
        <Text variant="titleMedium" style={styles.callTypeText}>
          {incomingCall.callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.buttonsRow}>
          <View style={styles.controlItem}>
            <IconButton
              icon="phone-hangup"
              size={32}
              iconColor="white"
              style={[styles.controlButton, styles.rejectButton]}
              onPress={handleReject}
            />
            <Text variant="bodyMedium" style={styles.controlLabel}>
              Decline
            </Text>
          </View>

          <View style={styles.controlItem}>
            <IconButton
              icon="phone"
              size={32}
              iconColor="white"
              style={[styles.controlButton, styles.acceptButton]}
              onPress={handleAccept}
            />
            <Text variant="bodyMedium" style={styles.controlLabel}>
              Accept
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  userSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatar: {
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  username: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
  },
  callTypeContainer: {
    alignItems: 'center',
    gap: 8,
  },
  callTypeText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  controls: {
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 48,
  },
  controlItem: {
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  controlLabel: {
    color: 'white',
    fontWeight: '500',
  },
});
