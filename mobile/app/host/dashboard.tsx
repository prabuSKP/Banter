// mobile/app/host/dashboard.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  List,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useHostStore } from '../../src/stores/hostStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

export default function HostDashboardScreen() {
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, isLoading } = useHostStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      await fetchDashboard();
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (!user?.isHost) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Not a Host</Title>
            <Text>You need to become a verified host to access this dashboard.</Text>
            <Button
              mode="contained"
              onPress={() => router.push('/host/apply')}
              style={styles.button}
            >
              Apply to Become Host
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (isLoading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Earnings Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Earnings Overview</Title>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {formatCurrency(dashboard?.availableBalance || 0)}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Available Balance
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {formatCurrency(dashboard?.totalEarnings || 0)}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Earnings
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {formatCurrency(dashboard?.totalWithdrawn || 0)}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Withdrawn
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            icon="cash"
            onPress={() => router.push('/host/withdrawal')}
            style={styles.button}
            disabled={(dashboard?.availableBalance || 0) < 500}
          >
            Request Withdrawal
          </Button>
          {(dashboard?.availableBalance || 0) < 500 && (
            <Text variant="bodySmall" style={styles.minWithdrawalText}>
              Minimum withdrawal amount is ₹500
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Performance Stats */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Performance</Title>

          <List.Item
            title="Total Calls"
            description={`${dashboard?.totalCallsAsHost || 0} calls completed`}
            left={(props) => <List.Icon {...props} icon="phone" />}
            right={() => (
              <Text variant="titleLarge" style={styles.statNumber}>
                {dashboard?.totalCallsAsHost || 0}
              </Text>
            )}
          />
          <Divider />

          <List.Item
            title="Total Minutes"
            description={formatMinutes(dashboard?.totalMinutesAsHost || 0)}
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
            right={() => (
              <Text variant="titleLarge" style={styles.statNumber}>
                {dashboard?.totalMinutesAsHost || 0}
              </Text>
            )}
          />
          <Divider />

          <List.Item
            title="Host Rating"
            description={`${dashboard?.hostRating?.toFixed(1) || '0.0'} out of 5`}
            left={(props) => <List.Icon {...props} icon="star" />}
            right={() => (
              <View style={styles.ratingContainer}>
                <Text variant="titleLarge" style={styles.ratingText}>
                  {dashboard?.hostRating?.toFixed(1) || '0.0'}
                </Text>
                <IconButton icon="star" size={20} iconColor="#FFD700" />
              </View>
            )}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>

          <Button
            mode="outlined"
            icon="history"
            onPress={() => router.push('/host/earnings')}
            style={styles.actionButton}
          >
            View Earnings History
          </Button>

          <Button
            mode="outlined"
            icon="cash-multiple"
            onPress={() => router.push('/host/withdrawals')}
            style={styles.actionButton}
          >
            Withdrawal History
          </Button>

          {dashboard?.pendingWithdrawals ? (
            <View style={styles.pendingWithdrawalsContainer}>
              <Text variant="bodyMedium" style={styles.pendingWithdrawalsText}>
                You have {dashboard.pendingWithdrawals} pending withdrawal
                {dashboard.pendingWithdrawals > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      {/* Earning Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>How You Earn</Title>

          <List.Item
            title="Video Calls"
            description="Earn 30% of call revenue"
            left={(props) => <List.Icon {...props} icon="video" color={COLORS.primary} />}
          />
          <Divider />

          <List.Item
            title="Audio Calls"
            description="Earn 15% of call revenue"
            left={(props) => <List.Icon {...props} icon="phone" color={COLORS.primary} />}
          />
          <Divider />

          <List.Item
            title="Performance Bonuses"
            description="Extra rewards for high ratings and milestones"
            left={(props) => <List.Icon {...props} icon="gift" color={COLORS.success} />}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: COLORS.background,
  },
  button: {
    marginTop: 16,
  },
  statsContainer: {
    marginTop: 16,
    gap: 16,
  },
  statBox: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    marginTop: 4,
    color: COLORS.textSecondary,
  },
  minWithdrawalText: {
    marginTop: 8,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  statNumber: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionButton: {
    marginTop: 12,
  },
  pendingWithdrawalsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  pendingWithdrawalsText: {
    color: '#856404',
    textAlign: 'center',
  },
});
