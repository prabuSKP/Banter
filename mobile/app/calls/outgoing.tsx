// mobile/app/calls/outgoing.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import {
  Text,
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallsStore } from '../../src/stores/callsStore';
import { Audio } from 'expo-av';

export default function OutgoingCallScreen() {
  const { userId, callType } = useLocalSearchParams<{
    userId: string;
    callType: 'audio' | 'video';
  }>();
  const theme = useTheme();
  const [sound, setSound] = useState<Audio.Sound>();
  const [userInfo, setUserInfo] = useState<any>(null);

  const { initiateCall, activeCall, error } = useCallsStore();

  useEffect(() => {
    loadUserInfo();
    startCall();
    playRingtone();

    return () => {
      stopRingtone();
    };
  }, []);

  const loadUserInfo = async () => {
    // TODO: Fetch user info from friends store or API
    setUserInfo({
      fullName: 'User Name',
      username: 'username',
      avatar: null,
    });
  };

  const startCall = async () => {
    if (!userId || !callType) return;

    try {
      await initiateCall(userId, callType as 'audio' | 'video');
      // Call initiated, wait for peer to accept
    } catch (err: any) {
      console.error('Failed to initiate call:', err);
      // Error will be shown via error state
    }
  };

  const playRingtone = async () => {
    try {
      const { sound: ringtone } = await Audio.Sound.createAsync(
        require('../../assets/sounds/outgoing.mp3'),
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

  const handleEndCall = async () => {
    await stopRingtone();
    router.back();
  };

  // Navigate to active call when connected
  useEffect(() => {
    if (activeCall) {
      stopRingtone();
      router.replace({
        pathname: '/calls/active',
        params: { callId: activeCall.callId },
      });
    }
  }, [activeCall]);

  // Handle errors
  useEffect(() => {
    if (error) {
      stopRingtone();
      setTimeout(() => {
        router.back();
      }, 2000);
    }
  }, [error]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      {/* User Info */}
      <View style={styles.userSection}>
        <Avatar.Image
          size={120}
          source={
            userInfo?.avatar
              ? { uri: userInfo.avatar }
              : require('../../assets/default-avatar.png')
          }
          style={styles.avatar}
        />

        <Text variant="headlineLarge" style={styles.userName}>
          {userInfo?.fullName || 'Loading...'}
        </Text>

        <Text variant="bodyLarge" style={styles.username}>
          @{userInfo?.username}
        </Text>

        <View style={styles.statusContainer}>
          {error ? (
            <Text variant="bodyLarge" style={styles.statusError}>
              {error}
            </Text>
          ) : (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text variant="bodyLarge" style={styles.statusText}>
                Calling...
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Call Type Indicator */}
      <View style={styles.callTypeContainer}>
        <IconButton
          icon={callType === 'video' ? 'video' : 'phone'}
          size={32}
          iconColor="white"
        />
        <Text variant="titleMedium" style={styles.callTypeText}>
          {callType === 'video' ? 'Video Call' : 'Voice Call'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.endCallButton}>
          <IconButton
            icon="phone-hangup"
            size={32}
            iconColor="white"
            style={[styles.controlButton, styles.endButton]}
            onPress={handleEndCall}
          />
          <Text variant="bodyMedium" style={styles.controlLabel}>
            End Call
          </Text>
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
    gap: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
  },
  statusError: {
    color: '#FFCDD2',
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
  endCallButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  endButton: {
    backgroundColor: '#F44336',
  },
  controlLabel: {
    color: 'white',
    fontWeight: '500',
  },
});
