// mobile/app/(tabs)/home.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Chip,
  Text,
  IconButton,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useCallsStore } from '../../src/stores/callsStore';
import { COLORS } from '../../src/constants';
import { CallLog } from '../../src/services/calls';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { callLogs, fetchCallLogs } = useCallsStore();

  useEffect(() => {
    fetchCallLogs(1);
  }, []);

  const formatCallTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (log: CallLog, isCaller: boolean) => {
    const isOutgoing = isCaller;
    const isMissed = log.status === 'missed';
    const isRejected = log.status === 'rejected';

    if (isMissed) return 'phone-missed';
    if (isRejected) return 'phone-cancel';
    if (isOutgoing) return 'phone-outgoing';
    return 'phone-incoming';
  };

  const getCallColor = (log: CallLog) => {
    if (log.status === 'missed') return '#F44336';
    if (log.status === 'rejected') return '#FF9800';
    return COLORS.primary;
  };

  const renderCallLogItem = ({ item }: { item: CallLog }) => {
    const isCaller = item.callerId === user?.id;
    const otherUser = isCaller ? item.receiver : item.caller;

    if (!otherUser) return null;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/calls/outgoing',
            params: { userId: otherUser.id, callType: item.callType },
          });
        }}
      >
        <View style={styles.callLogItem}>
          <Avatar.Image
            size={48}
            source={
              otherUser.avatar
                ? { uri: otherUser.avatar }
                : require('../../assets/default-avatar.png')
            }
          />

          <View style={styles.callLogInfo}>
            <Text variant="titleMedium" numberOfLines={1}>
              {otherUser.fullName}
            </Text>
            <View style={styles.callLogMeta}>
              <IconButton
                icon={getCallIcon(item, isCaller)}
                size={16}
                iconColor={getCallColor(item)}
                style={styles.callIcon}
              />
              <Text variant="bodySmall" style={styles.callMetaText}>
                {formatCallTime(item.createdAt)} • {formatDuration(item.duration)}
              </Text>
            </View>
          </View>

          <IconButton
            icon={item.callType === 'video' ? 'video' : 'phone'}
            size={20}
            iconColor={COLORS.primary}
            onPress={() => {
              router.push({
                pathname: '/calls/outgoing',
                params: { userId: otherUser.id, callType: item.callType },
              });
            }}
          />
        </View>
        <Divider />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <Avatar.Text
              size={60}
              label={user?.displayName?.[0]?.toUpperCase() || 'U'}
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Title>Welcome back!</Title>
              <Paragraph>{user?.displayName || user?.phoneNumber}</Paragraph>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Title>{user?.coins || 0}</Title>
              <Paragraph>Coins</Paragraph>
            </View>
            <View style={styles.stat}>
              <Title>0</Title>
              <Paragraph>Friends</Paragraph>
            </View>
            <View style={styles.stat}>
              <Title>0</Title>
              <Paragraph>Messages</Paragraph>
            </View>
          </View>

          {user?.isPremium && (
            <Chip icon="crown" style={styles.premiumChip}>
              Premium Member
            </Chip>
          )}
        </Card.Content>
      </Card>

      {!user?.isHost && user?.hostVerificationStatus !== 'pending' && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.hostBanner}>
              <View style={styles.hostBannerContent}>
                <Title>Become a Host</Title>
                <Paragraph>Earn money from video and audio calls!</Paragraph>
              </View>
              <Button
                mode="contained"
                icon="star"
                onPress={() => router.push('/host/apply')}
                style={styles.hostButton}
              >
                Apply Now
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {user?.isHost && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.hostDashboardBanner}>
              <View style={styles.hostBannerContent}>
                <Title>Host Dashboard</Title>
                <Paragraph>View your earnings and performance</Paragraph>
              </View>
              <Button
                mode="contained"
                icon="chart-line"
                onPress={() => router.push('/host/dashboard')}
                style={styles.hostButton}
              >
                View Dashboard
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="account-plus"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Find Friends
            </Button>
            <Button
              mode="contained"
              icon="message-plus"
              style={styles.actionButton}
              onPress={() => {}}
            >
              New Message
            </Button>
            <Button
              mode="contained"
              icon="phone"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Make a Call
            </Button>
            <Button
              mode="contained"
              icon="forum"
              style={styles.actionButton}
              onPress={() => {}}
            >
              Join Room
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Recent Calls</Title>
            <Button onPress={() => {}}>View All</Button>
          </View>
          {callLogs.length > 0 ? (
            <FlatList
              data={callLogs.slice(0, 5)}
              renderItem={renderCallLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Paragraph>No call history yet</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Active Rooms</Title>
          <Paragraph>No active rooms at the moment</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  welcomeCard: {
    margin: 16,
    backgroundColor: COLORS.background,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    alignItems: 'center',
  },
  premiumChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#FFD700',
  },
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: COLORS.background,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  callLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  callLogInfo: {
    flex: 1,
  },
  callLogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  callIcon: {
    margin: 0,
    padding: 0,
  },
  callMetaText: {
    color: COLORS.textSecondary,
  },
  hostBanner: {
    gap: 16,
  },
  hostDashboardBanner: {
    gap: 16,
  },
  hostBannerContent: {
    gap: 4,
  },
  hostButton: {
    alignSelf: 'flex-start',
  },
});
