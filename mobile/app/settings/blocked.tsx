// mobile/app/settings/blocked.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useFriendsStore } from '../../src/stores/friendsStore';
import { COLORS } from '../../src/constants';

interface BlockedUser {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
}

export default function BlockedUsersScreen() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      // TODO: Implement getBlockedUsers API call
      // const users = await friendsService.getBlockedUsers();
      // setBlockedUsers(users);

      // Mock data for now
      setBlockedUsers([
        {
          id: '1',
          fullName: 'Sarah Johnson',
          username: '@sarahj',
          avatar: undefined,
        },
        {
          id: '2',
          fullName: 'Mike Wilson',
          username: '@mikew',
          avatar: undefined,
        },
      ]);
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBlockedUsers();
    setRefreshing(false);
  };

  const handleUnblock = (userId: string, userName: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            setUnblocking(userId);
            try {
              // TODO: Implement unblock API call
              // await friendsService.unblockUser(userId);

              setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
              Alert.alert('Success', `${userName} has been unblocked`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to unblock user');
            } finally {
              setUnblocking(null);
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <Card style={styles.userCard}>
      <Card.Content style={styles.userContent}>
        <View style={styles.userInfo}>
          <Avatar.Text
            size={48}
            label={item.fullName.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text variant="titleMedium" style={styles.userName}>
              {item.fullName}
            </Text>
            <Text variant="bodySmall" style={styles.username}>
              {item.username}
            </Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => handleUnblock(item.id, item.fullName)}
          disabled={unblocking === item.id}
          style={styles.unblockButton}
          compact
        >
          {unblocking === item.id ? <ActivityIndicator size={16} /> : '🔓 Unblock'}
        </Button>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Blocked Users
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        You haven't blocked anyone yet
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading blocked users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={blockedUsers}
        renderItem={renderBlockedUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
  },
  username: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unblockButton: {
    marginLeft: 8,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
