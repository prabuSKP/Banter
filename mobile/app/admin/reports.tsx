// mobile/app/admin/reports.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { COLORS } from '../../src/constants';

interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      // TODO: Implement getReports API call
      // const data = await adminService.getReports(filter);
      // setReports(data);

      // Mock data
      const mockData: Report[] = [
        {
          id: '1',
          reporterId: 'user1',
          reporterName: 'John Doe',
          reportedId: 'user2',
          reportedName: 'Mike Brown',
          reason: 'Harassment',
          description: 'User was rude and inappropriate during the call. Made offensive comments.',
          status: 'open',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          reporterId: 'user3',
          reporterName: 'Sarah Wilson',
          reportedId: 'user4',
          reportedName: 'Alex Johnson',
          reason: 'Spam',
          description: 'Repeatedly calling without consent and sending unwanted requests.',
          status: 'open',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const filtered = mockData.filter((r) =>
        filter === 'open' ? r.status === 'open' : r.status !== 'open'
      );
      setReports(filtered);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleResolve = (report: Report) => {
    Alert.alert(
      'Resolve Report',
      `Take action on ${report.reportedName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block Reported User',
          style: 'destructive',
          onPress: async () => {
            setProcessing(report.id);
            try {
              // TODO: Implement block user and resolve report API call
              // await adminService.resolveReport(report.id, 'block_user');

              setReports((prev) => prev.filter((r) => r.id !== report.id));
              Alert.alert('Success', `${report.reportedName} has been blocked`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resolve report');
            } finally {
              setProcessing(null);
            }
          },
        },
        {
          text: 'Warn User',
          onPress: async () => {
            setProcessing(report.id);
            try {
              // TODO: Implement warn user and resolve report API call
              // await adminService.resolveReport(report.id, 'warn_user');

              setReports((prev) => prev.filter((r) => r.id !== report.id));
              Alert.alert('Success', `${report.reportedName} has been warned`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resolve report');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleDismiss = (report: Report) => {
    Alert.alert(
      'Dismiss Report',
      'Dismiss this report without taking action?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          onPress: async () => {
            setProcessing(report.id);
            try {
              // TODO: Implement dismiss report API call
              // await adminService.dismissReport(report.id);

              setReports((prev) => prev.filter((r) => r.id !== report.id));
              Alert.alert('Success', 'Report dismissed');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to dismiss report');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'harassment':
        return COLORS.error;
      case 'spam':
        return '#FF9800';
      case 'inappropriate content':
        return '#9C27B0';
      default:
        return COLORS.textSecondary;
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    <Card style={styles.reportCard}>
      <Card.Content>
        <View style={styles.header}>
          <Chip
            icon="alert-circle"
            style={{ backgroundColor: getReasonColor(item.reason) }}
            textStyle={{ color: '#fff' }}
          >
            {item.reason}
          </Chip>
          <Text variant="bodySmall" style={styles.timestamp}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.label}>
              Reporter:
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {item.reporterName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.label}>
              Reported User:
            </Text>
            <Text variant="bodyMedium" style={[styles.value, styles.reportedUser]}>
              {item.reportedName}
            </Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text variant="bodySmall" style={styles.label}>
            Description:
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            "{item.description}"
          </Text>
        </View>

        {filter === 'open' && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleResolve(item)}
              disabled={processing === item.id}
              style={styles.actionButton}
            >
              {processing === item.id ? <ActivityIndicator size={16} color="#fff" /> : 'Take Action'}
            </Button>
            <Button
              mode="outlined"
              icon="close"
              onPress={() => handleDismiss(item)}
              disabled={processing === item.id}
              style={styles.actionButton}
            >
              Dismiss
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No {filter === 'open' ? 'Open' : 'Resolved'} Reports
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {filter === 'open' && 'No reports to review'}
        {filter === 'resolved' && 'No resolved reports'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'open'}
          onPress={() => setFilter('open')}
          style={styles.chip}
        >
          Open
        </Chip>
        <Chip
          selected={filter === 'resolved'}
          onPress={() => setFilter('resolved')}
          style={styles.chip}
        >
          Resolved
        </Chip>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.background,
  },
  chip: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  reportCard: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: 16,
  },
  detailsSection: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontWeight: '500',
  },
  reportedUser: {
    color: COLORS.error,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  description: {
    marginTop: 4,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
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
