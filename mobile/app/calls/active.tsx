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
import RtcEngine, {
  ChannelProfileType,
  ClientRoleType,
  IRtcEngineEventHandler,
  RtcSurfaceView,
} from 'react-native-agora';
import RateHostDialog from '../../src/components/RateHostDialog';

const { width, height } = Dimensions.get('window');

export default function ActiveCallScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const theme = useTheme();

  const [engine, setEngine] = useState<RtcEngine | null>(null);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
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
    endCall,
    setCallDuration,
  } = useCallsStore();

  useEffect(() => {
    if (!activeCall) {
      router.back();
      return;
    }

    initializeAgora();
    startTimer();

    return () => {
      cleanup();
    };
  }, [activeCall]);

  const initializeAgora = async () => {
    try {
      const appId = process.env.EXPO_PUBLIC_AGORA_APP_ID;
      if (!appId) {
        console.error('Agora App ID not found');
        return;
      }

      // Create RTC engine
      const agoraEngine = await RtcEngine.create(appId);

      // Register event handlers
      const eventHandler: IRtcEngineEventHandler = {
        onUserJoined: (connection, uid) => {
          console.log('Remote user joined:', uid);
          setRemoteUid(uid);
        },
        onUserOffline: (connection, uid) => {
          console.log('Remote user left:', uid);
          setRemoteUid(null);
        },
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('Successfully joined channel');
        },
        onError: (err, msg) => {
          console.error('Agora error:', err, msg);
        },
      };

      agoraEngine.registerEventHandler(eventHandler);

      // Configure engine
      await agoraEngine.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication
      );
      await agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Enable audio
      await agoraEngine.enableAudio();

      // Enable video if video call
      if (activeCall && isVideoEnabled) {
        await agoraEngine.enableVideo();
        await agoraEngine.startPreview();
      }

      // Join channel
      if (activeCall) {
        await agoraEngine.joinChannel(
          activeCall.token,
          activeCall.channel,
          activeCall.uid,
          {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          }
        );
      }

      setEngine(agoraEngine);
    } catch (error) {
      console.error('Failed to initialize Agora:', error);
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

    if (engine) {
      await engine.leaveChannel();
      await engine.destroy();
    }
  };

  const handleToggleMute = async () => {
    if (engine) {
      await engine.muteLocalAudioStream(!isMuted);
      toggleMute();
    }
  };

  const handleToggleSpeaker = async () => {
    if (engine) {
      await engine.setEnableSpeakerphone(!isSpeakerOn);
      toggleSpeaker();
    }
  };

  const handleToggleVideo = async () => {
    if (engine) {
      if (isVideoEnabled) {
        await engine.muteLocalVideoStream(true);
        await engine.stopPreview();
      } else {
        await engine.muteLocalVideoStream(false);
        await engine.startPreview();
      }
      toggleVideo();
    }
  };

  const handleEndCall = async () => {
    await cleanup();
    await endCall();

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

  return (
    <View style={styles.container}>
      {/* Video Views */}
      {isVideoEnabled && remoteUid ? (
        <>
          {/* Remote Video (Full Screen) */}
          <RtcSurfaceView
            canvas={{ uid: remoteUid }}
            style={styles.remoteVideo}
          />

          {/* Local Video (Picture-in-Picture) */}
          <Surface style={styles.localVideoContainer} elevation={4}>
            <RtcSurfaceView
              canvas={{ uid: 0 }}
              style={styles.localVideo}
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
            {remoteUid ? 'Connected' : 'Connecting...'}
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
                icon={isMuted ? 'microphone-off' : 'microphone'}
                size={28}
                iconColor="white"
                style={[
                  styles.controlButton,
                  isMuted && styles.controlButtonActive,
                ]}
                onPress={handleToggleMute}
              />
              <Text variant="bodySmall" style={styles.controlLabel}>
                {isMuted ? 'Unmute' : 'Mute'}
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

          {activeCall && isVideoEnabled && (
            <View style={styles.secondaryRow}>
              <View style={styles.controlItem}>
                <IconButton
                  icon={isVideoEnabled ? 'video' : 'video-off'}
                  size={28}
                  iconColor="white"
                  style={[
                    styles.controlButton,
                    !isVideoEnabled && styles.controlButtonActive,
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
                  onPress={() => {
                    engine?.switchCamera();
                  }}
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
