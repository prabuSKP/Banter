// mobile/app/settings/index.tsx

import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  List,
  Divider,
  Switch,
  Button,
  Card,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const [darkMode, setDarkMode] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/phone');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ACCOUNT
          </Text>

          <List.Item
            title="Edit Profile"
            description="Update your name, avatar & bio"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/settings/profile')}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Privacy & Security"
            description="Control who can call & see your profile"
            left={(props) => <List.Icon {...props} icon="shield-lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/settings/privacy')}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/settings/notifications')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Preferences Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            PREFERENCES
          </Text>

          <List.Item
            title="Language"
            description="English"
            left={(props) => <List.Icon {...props} icon="web" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Language selection will be available in future updates');
            }}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Dark Mode"
            description={darkMode ? 'Enabled' : 'Disabled'}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Sound Effects"
            description={soundEnabled ? 'Enabled' : 'Disabled'}
            left={(props) => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                color={COLORS.primary}
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            ABOUT
          </Text>

          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Terms of Service', 'Terms of Service will open here');
            }}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy Policy will open here');
            }}
            style={styles.listItem}
          />
          <Divider />

          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={COLORS.error}
        >
          Logout
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
  logoutContainer: {
    padding: 16,
    marginTop: 8,
  },
  logoutButton: {
    paddingVertical: 4,
  },
  bottomPadding: {
    height: 32,
  },
});
