// mobile/app/settings/profile.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

export default function EditProfileScreen() {
  const { user, updateProfile, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    try {
      await updateProfile({
        fullName,
        username,
        bio,
        gender,
        dateOfBirth,
        avatar,
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text variant="headlineLarge" style={styles.avatarText}>
                    {fullName.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIconContainer}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text variant="bodySmall" style={styles.avatarHint}>
              Tap to change photo
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Basic Information
          </Text>

          <TextInput
            mode="outlined"
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            style={styles.input}
            disabled={isLoading}
          />

          <TextInput
            mode="outlined"
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="@username"
            autoCapitalize="none"
            style={styles.input}
            disabled={isLoading}
          />

          <TextInput
            mode="outlined"
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={3}
            style={styles.input}
            disabled={isLoading}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Personal Details
          </Text>

          <Text variant="bodyMedium" style={styles.fieldLabel}>
            Gender
          </Text>
          <RadioButton.Group onValueChange={setGender} value={gender}>
            <View style={styles.radioContainer}>
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label="Male"
                  value="male"
                  disabled={isLoading}
                  labelStyle={styles.radioLabel}
                />
              </View>
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label="Female"
                  value="female"
                  disabled={isLoading}
                  labelStyle={styles.radioLabel}
                />
              </View>
              <View style={styles.radioItem}>
                <RadioButton.Item
                  label="Other"
                  value="other"
                  disabled={isLoading}
                  labelStyle={styles.radioLabel}
                />
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            mode="outlined"
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="MM/DD/YYYY"
            style={styles.input}
            disabled={isLoading}
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
          {isLoading ? <ActivityIndicator color="#fff" /> : 'Save Changes'}
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
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  cameraIcon: {
    fontSize: 20,
  },
  avatarHint: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  input: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioItem: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
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
