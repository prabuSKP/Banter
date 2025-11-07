// mobile/app/settings/privacy.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  RadioButton,
  List,
  Divider,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

export default function PrivacySettingsScreen() {
  const { user, updatePrivacySettings, isLoading } = useAuthStore();

  const [whoCanCall, setWhoCanCall] = useState(user?.privacySettings?.whoCanCall || 'everyone');
  const [profileVisibility, setProfileVisibility] = useState(
    user?.privacySettings?.profileVisibility || 'everyone'
  );

  const handleSave = async () => {
    try {
      await updatePrivacySettings({
        whoCanCall,
        profileVisibility,
      });

      Alert.alert('Success', 'Privacy settings updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update privacy settings');
    }
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
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available in future updates');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            CALL SETTINGS
          </Text>

          <Text variant="bodyMedium" style={styles.fieldLabel}>
            Who can call me?
          </Text>

          <RadioButton.Group onValueChange={setWhoCanCall} value={whoCanCall}>
            <View style={styles.radioContainer}>
              <RadioButton.Item
                label="Everyone"
                value="everyone"
                disabled={isLoading}
                style={styles.radioItem}
              />
              <RadioButton.Item
                label="Friends only"
                value="friends"
                disabled={isLoading}
                style={styles.radioItem}
              />
              <RadioButton.Item
                label="No one"
                value="no_one"
                disabled={isLoading}
                style={styles.radioItem}
              />
            </View>
          </RadioButton.Group>

          <Text variant="bodySmall" style={styles.helperText}>
            {whoCanCall === 'everyone' && 'Anyone on Banter can call you'}
            {whoCanCall === 'friends' && 'Only your friends can call you'}
            {whoCanCall === 'no_one' && 'Nobody can call you'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            PROFILE VISIBILITY
          </Text>

          <Text variant="bodyMedium" style={styles.fieldLabel}>
            Who can see my profile?
          </Text>

          <RadioButton.Group onValueChange={setProfileVisibility} value={profileVisibility}>
            <View style={styles.radioContainer}>
              <RadioButton.Item
                label="Everyone"
                value="everyone"
                disabled={isLoading}
                style={styles.radioItem}
              />
              <RadioButton.Item
                label="Friends only"
                value="friends"
                disabled={isLoading}
                style={styles.radioItem}
              />
            </View>
          </RadioButton.Group>

          <Text variant="bodySmall" style={styles.helperText}>
            {profileVisibility === 'everyone' && 'Anyone can view your full profile'}
            {profileVisibility === 'friends' && 'Only your friends can view your full profile'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            BLOCKED USERS
          </Text>

          <List.Item
            title="Blocked Users"
            description="Manage blocked users list"
            left={(props) => <List.Icon {...props} icon="block-helper" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/settings/blocked')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            SECURITY
          </Text>

          <List.Item
            title="Change Password"
            description="Update your account password"
            left={(props) => <List.Icon {...props} icon="lock-reset" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Password change will be available in future updates');
            }}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={(props) => <List.Icon {...props} icon="delete-forever" color={COLORS.error} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleDeleteAccount}
            style={styles.listItem}
            titleStyle={{ color: COLORS.error }}
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
          {isLoading ? <ActivityIndicator color="#fff" /> : 'Save Privacy Settings'}
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
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioContainer: {
    marginBottom: 8,
  },
  radioItem: {
    paddingVertical: 0,
  },
  helperText: {
    color: COLORS.textSecondary,
    marginTop: 4,
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
