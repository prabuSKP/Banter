// mobile/app/(tabs)/wallet.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, IconButton, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useWalletStore } from '../../src/stores/walletStore';

export default function WalletScreen() {
  const {
    balance,
    transactions,
    statistics,
    isLoading,
    error,
    fetchBalance,
    fetchTransactions,
    fetchStatistics,
    refreshWallet,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    await Promise.all([
      fetchBalance(),
      fetchTransactions(1),
      fetchStatistics(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

  const handleRecharge = () => {
    router.push('/wallet/recharge');
  };

  const handleViewAllTransactions = () => {
    router.push('/wallet/transactions');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <Text variant="labelMedium" style={styles.balanceLabel}>
              Coin Balance
            </Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={handleRefresh}
            />
          </View>

          <View style={styles.balanceAmount}>
            <Text variant="displayMedium" style={styles.coins}>
              {balance?.coins || 0}
            </Text>
            <Text variant="titleMedium" style={styles.coinsLabel}>
              coins
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleRecharge}
            icon="plus"
            style={styles.rechargeButton}
          >
            Recharge Coins
          </Button>
        </Card.Content>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelSmall" style={styles.statLabel}>
                Total Earned
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.totalEarned}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="labelSmall" style={styles.statLabel}>
                Total Spent
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {statistics.totalSpent}
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Call Rates Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            Call Rates
          </Text>
          <View style={styles.rateRow}>
            <View style={styles.rateItem}>
              <IconButton icon="phone" size={24} />
              <View>
                <Text variant="bodyMedium">Audio Call</Text>
                <Text variant="bodySmall" style={styles.rateText}>
                  10 coins/minute
                </Text>
              </View>
            </View>

            <View style={styles.rateItem}>
              <IconButton icon="video" size={24} />
              <View>
                <Text variant="bodyMedium">Video Call</Text>
                <Text variant="bodySmall" style={styles.rateText}>
                  60 coins/minute
                </Text>
              </View>
            </View>
          </View>

          <Chip
            icon="crown"
            style={styles.premiumChip}
            textStyle={styles.premiumText}
          >
            Premium users get 50% off on all calls
          </Chip>
        </Card.Content>
      </Card>

      {/* Recent Transactions */}
      <Card style={styles.transactionsCard}>
        <Card.Content>
          <View style={styles.transactionsHeader}>
            <Text variant="titleMedium">Recent Transactions</Text>
            <Button onPress={handleViewAllTransactions}>View All</Button>
          </View>

          <Divider style={styles.divider} />

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <IconButton
                    icon={transaction.isCredit ? 'arrow-down' : 'arrow-up'}
                    iconColor={transaction.isCredit ? '#4CAF50' : '#F44336'}
                    size={20}
                  />
                  <View>
                    <Text variant="bodyMedium">{transaction.description}</Text>
                    <Text variant="bodySmall" style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <Text
                  variant="bodyLarge"
                  style={[
                    styles.transactionAmount,
                    { color: transaction.isCredit ? '#4CAF50' : '#F44336' },
                  ]}
                >
                  {transaction.isCredit ? '+' : ''}
                  {transaction.coins}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    margin: 16,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    opacity: 0.7,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 16,
  },
  coins: {
    fontWeight: 'bold',
    color: '#6200EE',
  },
  coinsLabel: {
    marginLeft: 8,
    opacity: 0.7,
  },
  rechargeButton: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    opacity: 0.7,
  },
  premiumChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
  },
  premiumText: {
    color: '#F57C00',
  },
  transactionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDate: {
    opacity: 0.5,
    fontSize: 12,
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
});
