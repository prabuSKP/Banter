// mobile/app/host/earnings.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  List,
  Divider,
  Chip,
} from 'react-native-paper';
import { useHostStore } from '../../src/stores/hostStore';
import { COLORS } from '../../src/constants';
import { Earning } from '../../src/services/host';

export default function EarningsHistoryScreen() {
  const { earnings, earningsPagination, fetchEarnings, isLoading } = useHostStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      await fetchEarnings(1);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarnings();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (
      !earningsPagination ||
      earningsPagination.page >= earningsPagination.totalPages ||
      loadingMore
    ) {
      return;
    }

    setLoadingMore(true);
    try {
      await fetchEarnings(earningsPagination.page + 1);
    } catch (error) {
      console.error('Failed to load more earnings:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallTypeIcon = (callType: string) => {
    return callType === 'video' ? 'video' : 'phone';
  };

  const getCallTypeColor = (callType: string) => {
    return callType === 'video' ? COLORS.primary : COLORS.success;
  };

  const renderEarningItem = ({ item }: { item: Earning }) => (
    <Card style={styles.earningCard}>
      <Card.Content>
        <View style={styles.earningHeader}>
          <View style={styles.callTypeContainer}>
            <Chip
              icon={getCallTypeIcon(item.callType)}
              style={{ backgroundColor: getCallTypeColor(item.callType) }}
              textStyle={{ color: '#fff' }}
            >
              {item.callType.toUpperCase()}
            </Chip>
          </View>
          <Text variant="titleLarge" style={styles.earningAmount}>
            +₹{item.hostEarning.toFixed(2)}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.earningDetails}>
          <List.Item
            title="Duration"
            description={formatDuration(item.callDuration)}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            style={styles.listItem}
          />

          <List.Item
            title="Total Revenue"
            description={`₹${item.totalRevenue.toFixed(2)}`}
            left={(props) => <List.Icon {...props} icon="cash" />}
            style={styles.listItem}
          />

          <List.Item
            title="Your Share"
            description={`${item.hostShare}%`}
            left={(props) => <List.Icon {...props} icon="percent" />}
            style={styles.listItem}
          />

          <List.Item
            title="Date"
            description={formatDate(item.createdAt)}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            style={styles.listItem}
          />

          <List.Item
            title="Status"
            description={item.status}
            left={(props) => <List.Icon {...props} icon="check-circle" />}
            style={styles.listItem}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Earnings Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Start receiving calls to earn money!
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator />
      </View>
    );
  };

  if (isLoading && earnings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {earningsPagination && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium">Total Earnings</Text>
            <Text variant="bodyMedium" style={styles.summaryText}>
              {earningsPagination.total} transactions
            </Text>
          </Card.Content>
        </Card>
      )}

      <FlatList
        data={earnings}
        renderItem={renderEarningItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  summaryText: {
    marginTop: 4,
    color: COLORS.textSecondary,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  earningCard: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  callTypeContainer: {
    flex: 1,
  },
  earningAmount: {
    fontWeight: 'bold',
    color: COLORS.success,
  },
  divider: {
    marginVertical: 8,
  },
  earningDetails: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 48,
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
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
