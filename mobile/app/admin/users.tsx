// mobile/app/admin/users.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Searchbar,
  Avatar,
  Chip,
} from 'react-native-paper';
import { COLORS } from '../../src/constants';

interface User {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
  isHost: boolean;
  totalCalls: number;
  totalFriends: number;
  rating?: number;
  isActive: boolean;
  isBlocked: boolean;
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      // TODO: Implement getUsers API call
      // const data = await adminService.getUsers();
      // setUsers(data);

      // Mock data
      const mockData: User[] = [
        {
          id: '1',
          fullName: 'John Doe',
          username: '@johndoe',
          isHost: false,
          totalCalls: 125,
          totalFriends: 50,
          isActive: true,
          isBlocked: false,
        },
        {
          id: '2',
          fullName: 'Sarah Wilson',
          username: '@sarahw',
          isHost: true,
          totalCalls: 450,
          totalFriends: 180,
          rating: 4.8,
          isActive: true,
          isBlocked: false,
        },
        {
          id: '3',
          fullName: 'Mike Johnson',
          username: '@mikej',
          isHost: false,
          totalCalls: 75,
          totalFriends: 30,
          isActive: false,
          isBlocked: true,
        },
      ];

      setUsers(mockData);
      setFilteredUsers(mockData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleBlock = (user: User) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${user.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: user.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            setProcessing(user.id);
            try {
              // TODO: Implement block/unblock user API call
              // await adminService.toggleBlockUser(user.id);

              setUsers((prev) =>
                prev.map((u) => (u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u))
              );
              Alert.alert('Success', `${user.fullName} has been ${action}ed`);
            } catch (error: any) {
              Alert.alert('Error', error.message || `Failed to ${action} user`);
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${user.fullName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setProcessing(user.id);
            try {
              // TODO: Implement delete user API call
              // await adminService.deleteUser(user.id);

              setUsers((prev) => prev.filter((u) => u.id !== user.id));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={48}
              label={item.fullName.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text variant="titleMedium" style={styles.userName}>
                  {item.fullName}
                </Text>
                {item.isHost && (
                  <Chip icon="star" compact style={styles.hostChip}>
                    Host
                  </Chip>
                )}
              </View>
              <Text variant="bodySmall" style={styles.username}>
                {item.username}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Chip
              icon={item.isActive ? 'check-circle' : 'circle-outline'}
              compact
              style={[styles.statusChip, item.isActive ? styles.activeChip : styles.inactiveChip]}
              textStyle={{ fontSize: 12 }}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Chip>
            {item.isBlocked && (
              <Chip icon="block-helper" compact style={styles.blockedChip} textStyle={{ fontSize: 12 }}>
                Blocked
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text variant="titleSmall" style={styles.statValue}>
              {item.totalCalls}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Calls
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleSmall" style={styles.statValue}>
              {item.totalFriends}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Friends
            </Text>
          </View>
          {item.isHost && item.rating && (
            <View style={styles.stat}>
              <Text variant="titleSmall" style={styles.statValue}>
                {item.rating.toFixed(1)} ⭐
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Rating
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            icon={item.isBlocked ? 'lock-open' : 'block-helper'}
            onPress={() => handleBlock(item)}
            disabled={processing === item.id}
            style={styles.actionButton}
            compact
            textColor={item.isBlocked ? COLORS.primary : COLORS.error}
          >
            {item.isBlocked ? 'Unblock' : 'Block'}
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => handleDelete(item)}
            disabled={processing === item.id}
            style={styles.actionButton}
            compact
            textColor={COLORS.error}
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Users Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {searchQuery ? 'No users match your search' : 'No users available'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
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
  searchBar: {
    margin: 16,
    marginBottom: 0,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontWeight: '600',
  },
  hostChip: {
    backgroundColor: '#FFD700',
    height: 24,
  },
  username: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    gap: 4,
  },
  statusChip: {
    height: 24,
  },
  activeChip: {
    backgroundColor: '#E8F5E9',
  },
  inactiveChip: {
    backgroundColor: COLORS.surface,
  },
  blockedChip: {
    backgroundColor: '#FFEBEE',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  statLabel: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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
