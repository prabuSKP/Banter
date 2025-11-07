// mobile/app/settings/notifications.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Switch,
  List,
  Divider,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { COLORS } from '../../src/constants';

export default function NotificationSettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);

  // Call Notifications
  const [incomingCalls, setIncomingCalls] = useState(true);
  const [missedCalls, setMissedCalls] = useState(true);

  // Social Notifications
  const [friendRequests, setFriendRequests] = useState(true);
  const [newFriends, setNewFriends] = useState(true);

  // Host Notifications
  const [earnings, setEarnings] = useState(true);
  const [withdrawals, setWithdrawals] = useState(true);
  const [ratings, setRatings] = useState(false);

  // Wallet Notifications
  const [transactions, setTransactions] = useState(true);
  const [lowBalance, setLowBalance] = useState(true);

  // Preferences
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [ledLight, setLedLight] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save notification settings API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Notification settings updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            CALL NOTIFICATIONS
          </Text>

          <List.Item
            title="Incoming Calls"
            description="Notify me when someone calls"
            left={(props) => <List.Icon {...props} icon="phone-incoming" />}
            right={() => (
              <Switch
                value={incomingCalls}
                onValueChange={setIncomingCalls}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Missed Calls"
            description="Notify me about missed calls"
            left={(props) => <List.Icon {...props} icon="phone-missed" />}
            right={() => (
              <Switch
                value={missedCalls}
                onValueChange={setMissedCalls}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            SOCIAL NOTIFICATIONS
          </Text>

          <List.Item
            title="Friend Requests"
            description="Notify me about new friend requests"
            left={(props) => <List.Icon {...props} icon="account-plus" />}
            right={() => (
              <Switch
                value={friendRequests}
                onValueChange={setFriendRequests}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="New Friends"
            description="Notify me when request is accepted"
            left={(props) => <List.Icon {...props} icon="account-check" />}
            right={() => (
              <Switch
                value={newFriends}
                onValueChange={setNewFriends}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            HOST NOTIFICATIONS
          </Text>

          <List.Item
            title="Earnings"
            description="Notify me about new earnings"
            left={(props) => <List.Icon {...props} icon="cash-plus" />}
            right={() => (
              <Switch
                value={earnings}
                onValueChange={setEarnings}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Withdrawals"
            description="Notify me about withdrawal updates"
            left={(props) => <List.Icon {...props} icon="bank-transfer" />}
            right={() => (
              <Switch
                value={withdrawals}
                onValueChange={setWithdrawals}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Ratings"
            description="Notify me about new ratings"
            left={(props) => <List.Icon {...props} icon="star" />}
            right={() => (
              <Switch
                value={ratings}
                onValueChange={setRatings}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            WALLET NOTIFICATIONS
          </Text>

          <List.Item
            title="Transactions"
            description="Notify me about wallet transactions"
            left={(props) => <List.Icon {...props} icon="swap-horizontal" />}
            right={() => (
              <Switch
                value={transactions}
                onValueChange={setTransactions}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Low Balance"
            description="Alert me when balance is low"
            left={(props) => <List.Icon {...props} icon="alert-circle" />}
            right={() => (
              <Switch
                value={lowBalance}
                onValueChange={setLowBalance}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            NOTIFICATION PREFERENCES
          </Text>

          <List.Item
            title="Sound"
            description="Play sound for notifications"
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={sound}
                onValueChange={setSound}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Vibration"
            description="Vibrate for notifications"
            left={(props) => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={vibration}
                onValueChange={setVibration}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="LED Light"
            description="Blink LED for notifications"
            left={(props) => <List.Icon {...props} icon="lightbulb-on" />}
            right={() => (
              <Switch
                value={ledLight}
                onValueChange={setLedLight}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <View style={styles.saveContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
          icon="content-save"
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : 'Save Notification Settings'}
        </Button>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
  saveContainer: {
    padding: 16,
    marginTop: 8,
  },
  saveButton: {
    paddingVertical: 4,
  },
  bottomPadding: {
    height: 32,
  },
});
