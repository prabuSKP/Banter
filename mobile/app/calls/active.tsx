// mobile/app/calls/active.tsx

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Text,
  Avatar,
  IconButton,
  Surface,
  useTheme,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallsStore } from '../../src/stores/callsStore';
import { useLiveKit } from '../../src/hooks/useLiveKit';
import { VideoView } from '@livekit/react-native';
import RateHostDialog from '../../src/components/RateHostDialog';

const { width, height } = Dimensions.get('window');

export default function ActiveCallScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const theme = useTheme();

  const [callTimer, setCallTimer] = useState(0);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const {
    activeCall,
    isMuted,
    isSpeakerOn,
    isVideoEnabled,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    endCall: storeEndCall,
    setCallDuration,
  } = useCallsStore();

  // LiveKit hook
  const {
    room,
    isConnected,
    localParticipant,
    remoteParticipants,
    isMicrophoneEnabled,
    isCameraEnabled,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    error: livekitError,
  } = useLiveKit({
    autoConnect: false, // We'll connect manually
  });

  useEffect(() => {
    if (!activeCall) {
      router.back();
      return;
    }

    // Connect to LiveKit room
    initializeLiveKit();
    startTimer();

    return () => {
      cleanup();
    };
  }, [activeCall]);

  const initializeLiveKit = async () => {
    if (!activeCall) return;

    try {
      await connect({
        url: activeCall.serverUrl,
        token: activeCall.token,
        options: {
          audio: true,
          video: isVideoEnabled,
        },
      });
    } catch (error) {
      console.error('Failed to connect to LiveKit:', error);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallTimer((prev) => {
        const newTime = prev + 1;
        setCallDuration(newTime);
        return newTime;
      });
    }, 1000);
  };

  const cleanup = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    await disconnect();
  };

  const handleToggleMute = async () => {
    await toggleMicrophone();
    toggleMute();
  };

  const handleToggleSpeaker = () => {
    // Note: Speaker toggle is handled differently in React Native
    // This is a placeholder - actual implementation depends on device audio routing
    toggleSpeaker();
  };

  const handleToggleVideo = async () => {
    await toggleCamera();
    toggleVideo();
  };

  const handleSwitchCamera = async () => {
    await switchCamera();
  };

  const handleEndCall = async () => {
    await cleanup();
    await storeEndCall();

    // Show rating dialog if the receiver was a host
    // TODO: Check if receiver (other user) is a host from activeCall data
    // For now, we'll show it for demo purposes - update this logic once user data is available
    const isReceiverHost = false; // Replace with: activeCall?.receiverIsHost

    if (isReceiverHost && callTimer > 30) {
      setShowRatingDialog(true);
    } else {
      router.back();
    }
  };

  const handleDismissRating = () => {
    setShowRatingDialog(false);
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeCall) {
    return null;
  }

  // Get the first remote participant
  const remoteParticipant = remoteParticipants[0];

  return (
    <View style={styles.container}>
      {/* Video Views */}
      {isVideoEnabled && remoteParticipant ? (
        <>
          {/* Remote Video (Full Screen) */}
          <View style={styles.remoteVideo}>
            <VideoView
              style={styles.videoView}
              videoTrack={remoteParticipant.videoTrackPublications[0]?.track}
            />
          </View>

          {/* Local Video (Picture-in-Picture) */}
          <Surface style={styles.localVideoContainer} elevation={4}>
            <VideoView
              style={styles.localVideo}
              videoTrack={localParticipant?.videoTrackPublications[0]?.track}
              mirror={true}
            />
          </Surface>
        </>
      ) : (
        /* Audio Call UI */
        <View style={[styles.audioContainer, { backgroundColor: theme.colors.primary }]}>
          <Avatar.Icon
            size={120}
            icon="account"
            style={styles.avatar}
          />
          <Text variant="headlineMedium" style={styles.userName}>
            User Name
          </Text>
          <Text variant="titleMedium" style={styles.callStatus}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Text>
        </View>
      )}

      {/* Call Info Overlay */}
      <Surface style={styles.topOverlay} elevation={2}>
        <Text variant="titleMedium" style={styles.callTimer}>
          {formatTime(callTimer)}
        </Text>
        <Text variant="bodyMedium" style={styles.callType}>
          {isVideoEnabled ? 'Video Call' : 'Voice Call'}
        </Text>
      </Surface>

      {/* Controls */}
      <Surface style={styles.controlsOverlay} elevation={4}>
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <View style={styles.controlItem}>
              <IconButton
                icon={isMicrophoneEnabled ? 'microphone' : 'microphone-off'}
                size={28}
                iconColor="white"
                style={[
                  styles.controlButton,
                  !isMicrophoneEnabled && styles.controlButtonActive,
                ]}
                onPress={handleToggleMute}
              />
              <Text variant="bodySmall" style={styles.controlLabel}>
                {isMicrophoneEnabled ? 'Mute' : 'Unmute'}
              </Text>
            </View>

            <View style={styles.controlItem}>
              <IconButton
                icon="phone-hangup"
                size={32}
                iconColor="white"
                style={[styles.controlButton, styles.endCallButton]}
                onPress={handleEndCall}
              />
              <Text variant="bodySmall" style={styles.controlLabel}>
                End
              </Text>
            </View>

            <View style={styles.controlItem}>
              <IconButton
                icon={isSpeakerOn ? 'volume-high' : 'volume-medium'}
                size={28}
                iconColor="white"
                style={[
                  styles.controlButton,
                  isSpeakerOn && styles.controlButtonActive,
                ]}
                onPress={handleToggleSpeaker}
              />
              <Text variant="bodySmall" style={styles.controlLabel}>
                Speaker
              </Text>
            </View>
          </View>

          {isVideoEnabled && (
            <View style={styles.secondaryRow}>
              <View style={styles.controlItem}>
                <IconButton
                  icon={isCameraEnabled ? 'video' : 'video-off'}
                  size={28}
                  iconColor="white"
                  style={[
                    styles.controlButton,
                    !isCameraEnabled && styles.controlButtonActive,
                  ]}
                  onPress={handleToggleVideo}
                />
                <Text variant="bodySmall" style={styles.controlLabel}>
                  Camera
                </Text>
              </View>

              <View style={styles.controlItem}>
                <IconButton
                  icon="camera-flip"
                  size={28}
                  iconColor="white"
                  style={styles.controlButton}
                  onPress={handleSwitchCamera}
                />
                <Text variant="bodySmall" style={styles.controlLabel}>
                  Flip
                </Text>
              </View>
            </View>
          )}
        </View>
      </Surface>

      {/* Rate Host Dialog */}
      {showRatingDialog && activeCall && (
        <RateHostDialog
          visible={showRatingDialog}
          onDismiss={handleDismissRating}
          hostId={activeCall.receiverId || ''}
          callId={activeCall.callId}
          hostName="Host" // TODO: Get actual host name from activeCall data
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    width: width,
    height: height,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
  },
  callStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  callTimer: {
    color: 'white',
    fontWeight: 'bold',
  },
  callType: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controls: {
    gap: 24,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
  },
  controlItem: {
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F44336',
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
  },
});
