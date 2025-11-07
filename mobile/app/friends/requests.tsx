// mobile/app/friends/requests.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  IconButton,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useFriendsStore } from '../../src/stores/friendsStore';
import { FriendRequest } from '../../src/types';

export default function FriendRequestsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    friendRequests,
    isLoading,
    fetchFriendRequests,
    acceptRequest,
    rejectRequest,
  } = useFriendsStore();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    await fetchFriendRequests();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: string, senderName: string) => {
    try {
      await acceptRequest(requestId);
      Alert.alert('Success', `You are now friends with ${senderName}!`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId: string, senderName: string) => {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject ${senderName}'s friend request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectRequest(requestId);
              Alert.alert('Rejected', `You rejected ${senderName}'s friend request`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject request');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <Surface style={styles.requestCard} elevation={1}>
      <View style={styles.requestHeader}>
        <Avatar.Image
          size={56}
          source={
            item.sender.avatar
              ? { uri: item.sender.avatar }
              : require('../../assets/default-avatar.png')
          }
        />

        <View style={styles.requestInfo}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.senderName}>
              {item.sender.fullName}
            </Text>
            {item.sender.isPremium && (
              <IconButton
                icon="crown"
                size={16}
                iconColor="#FFD700"
                style={styles.premiumIcon}
              />
            )}
          </View>

          <Text variant="bodySmall" style={styles.username}>
            @{item.sender.username}
          </Text>

          {item.sender.bio && (
            <Text variant="bodySmall" numberOfLines={2} style={styles.bio}>
              {item.sender.bio}
            </Text>
          )}

          {item.message && (
            <Surface style={styles.messageBubble} elevation={0}>
              <Text variant="bodySmall" numberOfLines={2}>
                "{item.message}"
              </Text>
            </Surface>
          )}

          <Text variant="bodySmall" style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        <Button
          mode="outlined"
          onPress={() => handleReject(item.id, item.sender.fullName)}
          style={styles.rejectButton}
        >
          Reject
        </Button>
        <Button
          mode="contained"
          onPress={() => handleAccept(item.id, item.sender.fullName)}
          style={styles.acceptButton}
        >
          Accept
        </Button>
      </View>
    </Surface>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="account-clock" size={64} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Pending Requests
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        You don't have any friend requests at the moment
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Friend Requests
        </Text>
        <View style={styles.headerRight}>
          {friendRequests.length > 0 && (
            <Chip>{friendRequests.length}</Chip>
          )}
        </View>
      </View>

      {isLoading && friendRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading requests...
          </Text>
        </View>
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
  },
  headerRight: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  requestCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  requestInfo: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontWeight: '600',
  },
  premiumIcon: {
    margin: 0,
    padding: 0,
  },
  username: {
    color: '#666',
  },
  bio: {
    color: '#888',
    marginTop: 4,
  },
  messageBubble: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  timestamp: {
    color: '#999',
    fontSize: 11,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
  },
  acceptButton: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
});
