// mobile/app/wallet/transactions.tsx

import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useWalletStore } from '../../src/stores/walletStore';

export default function TransactionsScreen() {
  const { transactions, isLoading, fetchTransactions } = useWalletStore();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setPage(1);
    await fetchTransactions(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchTransactions(nextPage);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'cash-plus';
      case 'bonus':
        return 'gift';
      case 'debit':
        return 'minus-circle';
      case 'refund':
        return 'cash-refund';
      case 'admin':
        return 'shield-account';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (isCredit: boolean) => {
    return isCredit ? '#4CAF50' : '#F44336';
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionRow}>
          <View style={styles.transactionLeft}>
            <IconButton
              icon={getTransactionIcon(item.type)}
              iconColor={getTransactionColor(item.isCredit)}
              size={24}
              style={styles.transactionIcon}
            />
            <View style={styles.transactionInfo}>
              <Text variant="bodyLarge" style={styles.transactionTitle}>
                {item.description}
              </Text>
              <View style={styles.transactionMeta}>
                <Chip
                  mode="flat"
                  textStyle={styles.chipText}
                  style={[
                    styles.typeChip,
                    { backgroundColor: item.isCredit ? '#E8F5E9' : '#FFEBEE' },
                  ]}
                >
                  {item.type}
                </Chip>
                <Text variant="bodySmall" style={styles.transactionDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {/* Show amount if available */}
              {item.amount > 0 && (
                <Text variant="bodySmall" style={styles.amountText}>
                  ₹{(item.amount / 100).toFixed(2)}
                </Text>
              )}

              {/* Show status */}
              <Chip
                mode="flat"
                textStyle={styles.statusText}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      item.status === 'completed'
                        ? '#E8F5E9'
                        : item.status === 'pending'
                        ? '#FFF3E0'
                        : '#FFEBEE',
                  },
                ]}
              >
                {item.status}
              </Chip>
            </View>
          </View>

          <View style={styles.transactionRight}>
            <Text
              variant="headlineSmall"
              style={[
                styles.coinsAmount,
                { color: getTransactionColor(item.isCredit) },
              ]}
            >
              {item.isCredit ? '+' : ''}
              {item.coins}
            </Text>
            <Text variant="bodySmall" style={styles.coinsLabel}>
              coins
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <IconButton icon="wallet-outline" size={64} iconColor="#ccc" />
      <Text variant="titleMedium" style={styles.emptyTitle}>
        No Transactions Yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    elevation: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    margin: 0,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 8,
  },
  transactionTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  transactionDate: {
    opacity: 0.6,
  },
  amountText: {
    opacity: 0.7,
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  transactionRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  coinsAmount: {
    fontWeight: 'bold',
  },
  coinsLabel: {
    opacity: 0.7,
    fontSize: 12,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
