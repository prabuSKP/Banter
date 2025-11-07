// mobile/app/notifications/index.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS } from '../../src/constants';

interface Notification {
  id: string;
  type: 'call' | 'friend' | 'host' | 'wallet' | 'system';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  actionData?: any;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: Implement getNotifications API call
      // const data = await notificationService.getNotifications();
      // setNotifications(data);

      // Mock data for now
      setNotifications([
        {
          id: '1',
          type: 'call',
          title: 'Missed Call',
          body: 'John called you',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: false,
        },
        {
          id: '2',
          type: 'friend',
          title: 'Friend Request',
          body: 'Sarah sent you a friend request',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          isRead: false,
        },
        {
          id: '3',
          type: 'wallet',
          title: 'Wallet Update',
          body: '₹100 added to wallet',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
        {
          id: '4',
          type: 'host',
          title: 'Host Status',
          body: 'Application approved!',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setNotifications([]);
            Alert.alert('Success', 'All notifications cleared');
          },
        },
      ]
    );
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'call':
        // Navigate to call history or call back
        break;
      case 'friend':
        router.push('/(tabs)/friends');
        break;
      case 'wallet':
        router.push('/(tabs)/wallet');
        break;
      case 'host':
        router.push('/host/dashboard');
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call':
        return 'phone-missed';
      case 'friend':
        return 'account-plus';
      case 'host':
        return 'star';
      case 'wallet':
        return 'wallet';
      case 'system':
        return 'information';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'call':
        return COLORS.error;
      case 'friend':
        return COLORS.primary;
      case 'host':
        return '#FFD700';
      case 'wallet':
        return COLORS.success;
      case 'system':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const groupNotificationsByDate = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach((notif) => {
      const date = new Date(notif.timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / 86400000);

      if (days === 0) today.push(notif);
      else if (days === 1) yesterday.push(notif);
      else older.push(notif);
    });

    return { today, yesterday, older };
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <Card.Content style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <IconButton
            icon={getNotificationIcon(item.type)}
            size={24}
            iconColor={getNotificationColor(item.type)}
            style={styles.icon}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text variant="titleSmall" style={styles.title}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text variant="bodyMedium" style={styles.body}>
            {item.body}
          </Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderSection = (title: string, data: Notification[]) => {
    if (data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          {title}
        </Text>
        {data.map((item) => (
          <View key={item.id}>{renderNotification({ item })}</View>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Notifications
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        You're all caught up!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const { today, yesterday, older } = groupNotificationsByDate();
  const hasNotifications = notifications.length > 0;

  return (
    <View style={styles.container}>
      {hasNotifications && (
        <View style={styles.header}>
          <Text variant="titleMedium">Notifications</Text>
          <Button mode="text" onPress={handleClearAll} compact>
            Clear All
          </Button>
        </View>
      )}

      <FlatList
        data={[{ key: 'sections' }]}
        renderItem={() => (
          <>
            {renderSection('TODAY', today)}
            {renderSection('YESTERDAY', yesterday)}
            {renderSection('OLDER', older)}
          </>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  listContent: {
    flexGrow: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    margin: 0,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  body: {
    marginBottom: 4,
  },
  timestamp: {
    color: COLORS.textSecondary,
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
