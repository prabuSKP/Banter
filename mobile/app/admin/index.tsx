// mobile/app/admin/index.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  ActivityIndicator,
  List,
  Divider,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

interface PlatformStats {
  totalUsers: number;
  callsToday: number;
  activeHosts: number;
  totalRevenue: number;
}

interface PendingCounts {
  hostApplications: number;
  withdrawals: number;
  reports: number;
}

export default function AdminDashboardScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    callsToday: 0,
    activeHosts: 0,
    totalRevenue: 0,
  });
  const [pending, setPending] = useState<PendingCounts>({
    hostApplications: 0,
    withdrawals: 0,
    reports: 0,
  });

  useEffect(() => {
    // Check if user is admin
    if (!user?.role || user.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // TODO: Implement admin dashboard API call
      // const data = await adminService.getDashboard();
      // setStats(data.stats);
      // setPending(data.pending);

      // Mock data for now
      setStats({
        totalUsers: 1250,
        callsToday: 5430,
        activeHosts: 89,
        totalRevenue: 125000,
      });

      setPending({
        hostApplications: 5,
        withdrawals: 8,
        reports: 2,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  const totalPending = pending.hostApplications + pending.withdrawals + pending.reports;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title>Platform Statistics</Title>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.totalUsers.toLocaleString()}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Users
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.callsToday.toLocaleString()}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Calls Today
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.activeHosts}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Active Hosts
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="headlineMedium" style={styles.statValue}>
                ₹{(stats.totalRevenue / 1000).toFixed(1)}K
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Revenue
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Pending Actions</Title>
            {totalPending > 0 && (
              <View style={styles.badge}>
                <Text variant="labelSmall" style={styles.badgeText}>
                  {totalPending}
                </Text>
              </View>
            )}
          </View>

          <List.Item
            title="Host Applications"
            description={`${pending.hostApplications} pending review`}
            left={(props) => <List.Icon {...props} icon="account-star" color={COLORS.primary} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/admin/hosts')}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Withdrawals"
            description={`${pending.withdrawals} pending approval`}
            left={(props) => <List.Icon {...props} icon="bank-transfer" color={COLORS.success} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/admin/withdrawals')}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Reports"
            description={`${pending.reports} unresolved`}
            left={(props) => <List.Icon {...props} icon="alert-circle" color={COLORS.error} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/admin/reports')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>

          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              icon="chart-bar"
              onPress={() => Alert.alert('Coming Soon', 'Analytics will be available soon')}
              style={styles.actionButton}
            >
              Analytics
            </Button>

            <Button
              mode="outlined"
              icon="account-group"
              onPress={() => router.push('/admin/users')}
              style={styles.actionButton}
            >
              Users
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsGrid: {
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
  listItem: {
    paddingHorizontal: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 32,
  },
});
