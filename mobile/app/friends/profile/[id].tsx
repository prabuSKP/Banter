// mobile/app/friends/profile/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../../src/services/api';
import { UserProfile } from '../../../src/types';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/${id}`);
      setProfile(response.data.data);
      setIsFriend(response.data.data.isFriend || false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load user profile');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await api.post('/friends/request', { receiverId: id });
      Alert.alert('Success', `Friend request sent to ${profile?.fullName}!`);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send friend request'
      );
    }
  };

  const handleRemoveFriend = async () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${profile?.fullName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/friends/${id}`);
              setIsFriend(false);
              Alert.alert(
                'Success',
                `${profile?.fullName} has been removed from your friends`
              );
            } catch (error: any) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleStartCall = (callType: 'audio' | 'video') => {
    router.push({
      pathname: '/calls/outgoing',
      params: { userId: id, callType },
    });
  };

  const handleStartChat = () => {
    router.push({
      pathname: '/messages/conversation',
      params: { userId: id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle" size={64} />
        <Text variant="headlineSmall">Profile Not Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall" style={styles.title}>
          Profile
        </Text>
        <IconButton icon="dots-vertical" size={24} onPress={() => {}} />
      </View>

      <ScrollView>
        <Surface style={styles.profileHeader} elevation={2}>
          <Avatar.Image
            size={100}
            source={
              profile.avatar
                ? { uri: profile.avatar }
                : require('../../../assets/default-avatar.png')
            }
          />

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text variant="headlineMedium" style={styles.name}>
                {profile.fullName}
              </Text>
              {profile.isPremium && (
                <IconButton
                  icon="crown"
                  size={20}
                  iconColor="#FFD700"
                  style={styles.premiumIcon}
                />
              )}
            </View>

            <Text variant="bodyMedium" style={styles.username}>
              @{profile.username}
            </Text>

            <View style={styles.statusRow}>
              <Chip
                icon="circle"
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: profile.isOnline
                      ? '#E8F5E9'
                      : theme.colors.surfaceVariant,
                  },
                ]}
              >
                {profile.isOnline ? 'Online' : 'Offline'}
              </Chip>

              {profile.isPremium && (
                <Chip icon="star" style={styles.premiumChip}>
                  Premium
                </Chip>
              )}
            </View>
          </View>
        </Surface>

        {profile.bio && (
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About
            </Text>
            <Text variant="bodyMedium" style={styles.bio}>
              {profile.bio}
            </Text>
          </Surface>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Interests
            </Text>
            <View style={styles.interestsContainer}>
              {profile.interests.map((interest, index) => (
                <Chip key={index} style={styles.interestChip}>
                  {interest}
                </Chip>
              ))}
            </View>
          </Surface>
        )}

        {profile.lookingFor && profile.lookingFor.length > 0 && (
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Looking For
            </Text>
            <View style={styles.interestsContainer}>
              {profile.lookingFor.map((item, index) => (
                <Chip key={index} icon="magnify" style={styles.lookingForChip}>
                  {item}
                </Chip>
              ))}
            </View>
          </Surface>
        )}

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Details
          </Text>

          {profile.gender && (
            <View style={styles.detailRow}>
              <IconButton icon="gender-male-female" size={20} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
              </Text>
            </View>
          )}

          {profile.language && (
            <View style={styles.detailRow}>
              <IconButton icon="translate" size={20} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {profile.language.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <IconButton icon="calendar" size={20} />
            <Text variant="bodyMedium" style={styles.detailText}>
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Surface>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Surface style={styles.actionBar} elevation={4}>
        {isFriend ? (
          <>
            <IconButton
              icon="message"
              mode="contained"
              size={24}
              onPress={handleStartChat}
              style={styles.actionButton}
            />
            <IconButton
              icon="phone"
              mode="contained"
              size={24}
              onPress={() => handleStartCall('audio')}
              style={styles.actionButton}
            />
            <IconButton
              icon="video"
              mode="contained"
              size={24}
              onPress={() => handleStartCall('video')}
              style={styles.actionButton}
            />
            <Button
              mode="outlined"
              onPress={handleRemoveFriend}
              style={styles.removeButton}
            >
              Remove Friend
            </Button>
          </>
        ) : (
          <Button
            mode="contained"
            icon="account-plus"
            onPress={handleSendFriendRequest}
            style={styles.addFriendButton}
          >
            Send Friend Request
          </Button>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    gap: 16,
  },
  nameContainer: {
    alignItems: 'center',
    gap: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
  premiumIcon: {
    margin: 0,
  },
  username: {
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusChip: {
    height: 28,
  },
  premiumChip: {
    height: 28,
    backgroundColor: '#FFF8E1',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  bio: {
    color: '#666',
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    height: 32,
  },
  lookingForChip: {
    height: 32,
    backgroundColor: '#E3F2FD',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#666',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    gap: 8,
  },
  actionButton: {
    flex: 0,
  },
  removeButton: {
    flex: 1,
  },
  addFriendButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});
