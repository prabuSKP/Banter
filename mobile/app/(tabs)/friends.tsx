// mobile/app/(tabs)/friends.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  IconButton,
  Searchbar,
  FAB,
  Badge,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useFriendsStore } from '../../src/stores/friendsStore';
import { Friend } from '../../src/types';

export default function FriendsScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    friends,
    friendRequests,
    isLoading,
    error,
    fetchFriends,
    fetchFriendRequests,
    removeFriend,
  } = useFriendsStore();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    await Promise.all([
      fetchFriends(1),
      fetchFriendRequests(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friendId);
              Alert.alert('Success', `${friendName} has been removed from your friends`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleStartCall = (friend: Friend, callType: 'audio' | 'video') => {
    // TODO: Navigate to call screen
    router.push({
      pathname: '/calls/outgoing',
      params: { userId: friend.id, callType },
    });
  };

  const handleStartChat = (friend: Friend) => {
    router.push({
      pathname: '/messages/conversation',
      params: { userId: friend.id },
    });
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <Surface style={styles.friendCard} elevation={1}>
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={56}
            source={item.avatar ? { uri: item.avatar } : require('../../assets/default-avatar.png')}
          />
          {item.isOnline && <Badge style={styles.onlineBadge} size={16} />}
        </View>

        <View style={styles.friendDetails}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.friendName}>
              {item.fullName}
            </Text>
            {item.isPremium && (
              <IconButton
                icon="crown"
                size={16}
                iconColor="#FFD700"
                style={styles.premiumIcon}
              />
            )}
          </View>

          <Text variant="bodySmall" style={styles.username}>
            @{item.username}
          </Text>

          {item.bio && (
            <Text variant="bodySmall" numberOfLines={1} style={styles.bio}>
              {item.bio}
            </Text>
          )}

          <Text
            variant="bodySmall"
            style={[
              styles.status,
              { color: item.isOnline ? theme.colors.primary : theme.colors.outline },
            ]}
          >
            {item.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <View style={styles.friendActions}>
        <IconButton
          icon="message"
          mode="contained"
          size={20}
          onPress={() => handleStartChat(item)}
        />
        <IconButton
          icon="phone"
          mode="contained"
          size={20}
          onPress={() => handleStartCall(item, 'audio')}
        />
        <IconButton
          icon="video"
          mode="contained"
          size={20}
          onPress={() => handleStartCall(item, 'video')}
        />
        <IconButton
          icon="dots-vertical"
          size={20}
          onPress={() =>
            Alert.alert('Actions', `More actions for ${item.fullName}`, [
              { text: 'View Profile', onPress: () => router.push(`/friends/profile/${item.id}`) },
              { text: 'Remove Friend', style: 'destructive', onPress: () => handleRemoveFriend(item.id, item.fullName) },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
        />
      </View>
    </Surface>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconButton icon="account-group" size={64} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Friends Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Start adding friends to connect and chat!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Friends
        </Text>

        {friendRequests.length > 0 && (
          <Surface style={styles.requestsBanner} elevation={1}>
            <IconButton icon="account-clock" size={24} />
            <Text variant="bodyMedium" style={styles.requestsText}>
              You have {friendRequests.length} pending friend request{friendRequests.length > 1 ? 's' : ''}
            </Text>
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={() => router.push('/friends/requests')}
            />
          </Surface>
        )}

        <Searchbar
          placeholder="Search friends..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {isLoading && friends.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading friends...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <FAB
        icon="account-plus"
        label="Add Friend"
        style={styles.fab}
        onPress={() => router.push('/friends/search')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  requestsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF8E1',
  },
  requestsText: {
    flex: 1,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  friendCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#4CAF50',
  },
  friendDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendName: {
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
  status: {
    fontSize: 12,
    marginTop: 4,
  },
  friendActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
