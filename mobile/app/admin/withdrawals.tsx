// mobile/app/admin/withdrawals.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  List,
  Divider,
} from 'react-native-paper';
import { COLORS } from '../../src/constants';

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: 'upi' | 'bank_transfer' | 'wallet';
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  paymentDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
}

export default function WithdrawalsScreen() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'processed'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadWithdrawals();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      // TODO: Implement getWithdrawals API call
      // const data = await adminService.getWithdrawals(filter);
      // setWithdrawals(data);

      // Mock data
      const mockData: Withdrawal[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          amount: 1000,
          method: 'upi',
          requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          paymentDetails: {
            upiId: 'john@paytm',
          },
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Sarah Johnson',
          amount: 2500,
          method: 'bank_transfer',
          requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          paymentDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            accountHolderName: 'Sarah Johnson',
          },
        },
      ];

      const filtered = mockData.filter((w) =>
        filter === 'pending' ? w.status === 'pending' : w.status !== 'pending'
      );
      setWithdrawals(filtered);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const handleApprove = (withdrawal: Withdrawal) => {
    Alert.alert(
      'Approve Withdrawal',
      `Approve withdrawal of ₹${withdrawal.amount} to ${withdrawal.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessing(withdrawal.id);
            try {
              // TODO: Implement approve withdrawal API call
              // await adminService.approveWithdrawal(withdrawal.id);

              setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id));
              Alert.alert('Success', 'Withdrawal approved and processed');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve withdrawal');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (withdrawal: Withdrawal) => {
    Alert.alert(
      'Reject Withdrawal',
      `Reject withdrawal of ₹${withdrawal.amount} from ${withdrawal.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessing(withdrawal.id);
            try {
              // TODO: Implement reject withdrawal API call
              // await adminService.rejectWithdrawal(withdrawal.id);

              setWithdrawals((prev) => prev.filter((w) => w.id !== withdrawal.id));
              Alert.alert('Success', 'Withdrawal rejected');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject withdrawal');
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

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'wallet':
        return 'Wallet';
      default:
        return method;
    }
  };

  const renderWithdrawal = ({ item }: { item: Withdrawal }) => (
    <Card style={styles.withdrawalCard}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="headlineSmall" style={styles.amount}>
              ₹{item.amount.toLocaleString()}
            </Text>
            <Text variant="bodyMedium" style={styles.userName}>
              {item.userName}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              Requested: {formatTime(item.requestedAt)}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsSection}>
          <List.Item
            title="Payment Method"
            description={getMethodLabel(item.method)}
            left={(props) => <List.Icon {...props} icon="credit-card" />}
            style={styles.listItem}
          />

          {item.method === 'upi' && (
            <List.Item
              title="UPI ID"
              description={item.paymentDetails.upiId}
              left={(props) => <List.Icon {...props} icon="wallet" />}
              style={styles.listItem}
            />
          )}

          {item.method === 'bank_transfer' && (
            <>
              <List.Item
                title="Account Holder"
                description={item.paymentDetails.accountHolderName}
                left={(props) => <List.Icon {...props} icon="account" />}
                style={styles.listItem}
              />
              <List.Item
                title="Account Number"
                description={`****${item.paymentDetails.accountNumber?.slice(-4)}`}
                left={(props) => <List.Icon {...props} icon="bank" />}
                style={styles.listItem}
              />
              <List.Item
                title="IFSC Code"
                description={item.paymentDetails.ifscCode}
                left={(props) => <List.Icon {...props} icon="code-tags" />}
                style={styles.listItem}
              />
            </>
          )}
        </View>

        {filter === 'pending' && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleApprove(item)}
              disabled={processing === item.id}
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            >
              {processing === item.id ? <ActivityIndicator size={16} color="#fff" /> : 'Approve'}
            </Button>
            <Button
              mode="outlined"
              icon="close"
              onPress={() => handleReject(item)}
              disabled={processing === item.id}
              style={styles.actionButton}
              textColor={COLORS.error}
            >
              Reject
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No {filter === 'pending' ? 'Pending' : 'Processed'} Withdrawals
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {filter === 'pending' && 'No withdrawal requests to review'}
        {filter === 'processed' && 'No processed withdrawals'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading withdrawals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'pending'}
          onPress={() => setFilter('pending')}
          style={styles.chip}
        >
          Pending
        </Chip>
        <Chip
          selected={filter === 'processed'}
          onPress={() => setFilter('processed')}
          style={styles.chip}
        >
          Processed
        </Chip>
      </View>

      <FlatList
        data={withdrawals}
        renderItem={renderWithdrawal}
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
  withdrawalCard: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userName: {
    marginTop: 4,
  },
  timestamp: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  detailsSection: {
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
