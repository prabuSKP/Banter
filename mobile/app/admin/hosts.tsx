// mobile/app/admin/hosts.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Linking } from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  TextInput,
  Portal,
  Dialog,
} from 'react-native-paper';
import { COLORS } from '../../src/constants';

interface HostApplication {
  id: string;
  userId: string;
  userName: string;
  appliedAt: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export default function HostApplicationsScreen() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ visible: boolean; userId: string; userName: string }>({
    visible: false,
    userId: '',
    userName: '',
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      // TODO: Implement getHostApplications API call
      // const data = await adminService.getHostApplications(filter);
      // setApplications(data);

      // Mock data
      const mockData: HostApplication[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          documents: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'],
          status: 'pending',
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Sarah Wilson',
          appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          documents: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf', 'https://example.com/doc3.pdf'],
          status: 'pending',
        },
      ];

      setApplications(mockData.filter((app) => app.status === filter));
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleApprove = (userId: string, userName: string) => {
    Alert.alert(
      'Approve Application',
      `Are you sure you want to approve ${userName} as a host?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setProcessing(userId);
            try {
              // TODO: Implement approve host API call
              // await adminService.approveHost(userId);

              setApplications((prev) => prev.filter((app) => app.userId !== userId));
              Alert.alert('Success', `${userName} has been approved as a host`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve application');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    setProcessing(rejectDialog.userId);
    try {
      // TODO: Implement reject host API call
      // await adminService.rejectHost(rejectDialog.userId, rejectionReason);

      setApplications((prev) => prev.filter((app) => app.userId !== rejectDialog.userId));
      Alert.alert('Success', `${rejectDialog.userName}'s application has been rejected`);
      setRejectDialog({ visible: false, userId: '', userName: '' });
      setRejectionReason('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDocument = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open document');
    });
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

  const renderApplication = ({ item }: { item: HostApplication }) => (
    <Card style={styles.applicationCard}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium" style={styles.userName}>
              {item.userName}
            </Text>
            <Text variant="bodySmall" style={styles.timestamp}>
              Applied: {formatTime(item.appliedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.documentsSection}>
          <Text variant="bodyMedium" style={styles.sectionLabel}>
            Documents ({item.documents.length})
          </Text>
          <View style={styles.documentsContainer}>
            {item.documents.map((doc, index) => (
              <Button
                key={index}
                mode="outlined"
                icon="file-document"
                onPress={() => handleViewDocument(doc)}
                compact
                style={styles.documentButton}
              >
                Doc {index + 1}
              </Button>
            ))}
          </View>
        </View>

        {filter === 'pending' && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleApprove(item.userId, item.userName)}
              disabled={processing === item.userId}
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            >
              {processing === item.userId ? <ActivityIndicator size={16} color="#fff" /> : 'Approve'}
            </Button>
            <Button
              mode="outlined"
              icon="close"
              onPress={() => setRejectDialog({ visible: true, userId: item.userId, userName: item.userName })}
              disabled={processing === item.userId}
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
        No {filter} Applications
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {filter === 'pending' && 'No pending applications to review'}
        {filter === 'approved' && 'No approved applications'}
        {filter === 'rejected' && 'No rejected applications'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading applications...</Text>
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
          selected={filter === 'approved'}
          onPress={() => setFilter('approved')}
          style={styles.chip}
        >
          Approved
        </Chip>
        <Chip
          selected={filter === 'rejected'}
          onPress={() => setFilter('rejected')}
          style={styles.chip}
        >
          Rejected
        </Chip>
      </View>

      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <Portal>
        <Dialog
          visible={rejectDialog.visible}
          onDismiss={() => setRejectDialog({ visible: false, userId: '', userName: '' })}
        >
          <Dialog.Title>Reject Application</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Please provide a reason for rejecting {rejectDialog.userName}'s application:
            </Text>
            <TextInput
              mode="outlined"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Rejection reason..."
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialog({ visible: false, userId: '', userName: '' })}>
              Cancel
            </Button>
            <Button onPress={handleReject} textColor={COLORS.error}>
              Reject
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  applicationCard: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    marginBottom: 16,
  },
  userName: {
    fontWeight: '600',
  },
  timestamp: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  documentsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: '500',
    marginBottom: 8,
  },
  documentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentButton: {
    minWidth: 80,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  dialogText: {
    marginBottom: 16,
  },
  input: {
    marginTop: 8,
  },
});
