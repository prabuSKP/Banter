// mobile/app/(tabs)/profile.tsx

import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, List, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import authService from '../../src/services/auth';
import { COLORS } from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

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
            await authService.logout();
            router.replace('/(auth)/phone');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              router.replace('/(auth)/phone');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user?.displayName?.[0]?.toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Title style={styles.name}>{user?.displayName || 'User'}</Title>
          <Paragraph style={styles.phone}>{user?.phoneNumber}</Paragraph>

          {user?.bio && (
            <Paragraph style={styles.bio}>{user.bio}</Paragraph>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Title>{user?.coins || 0}</Title>
              <Paragraph>Coins</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title>0</Title>
              <Paragraph>Friends</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title>0</Title>
              <Paragraph>Calls</Paragraph>
            </View>
          </View>

          <Button
            mode="contained"
            icon="pencil"
            style={styles.editButton}
            onPress={() => {}}
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Account Settings</List.Subheader>
          <List.Item
            title="Premium Membership"
            description={user?.isPremium ? 'Active' : 'Upgrade to Premium'}
            left={props => <List.Icon {...props} icon="crown" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Blocked Users"
            left={props => <List.Icon {...props} icon="block-helper" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy & Security"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Support</List.Subheader>
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-check" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </List.Section>
      </Card>

      <View style={styles.actionsContainer}>
        <Button
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={COLORS.error}
        >
          Logout
        </Button>

        <Button
          mode="text"
          icon="delete"
          onPress={handleDeleteAccount}
          textColor={COLORS.error}
          style={styles.deleteButton}
        >
          Delete Account
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  profileCard: {
    margin: 16,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  phone: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  bio: {
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  editButton: {
    marginTop: 8,
    minWidth: 150,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
  deleteButton: {
    marginBottom: 32,
  },
});
