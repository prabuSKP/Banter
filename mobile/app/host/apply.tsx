// mobile/app/host/apply.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  Title,
  Paragraph,
  List,
  Divider,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useHostStore } from '../../src/stores/hostStore';
import { useAuthStore } from '../../src/stores/authStore';
import { COLORS } from '../../src/constants';

export default function HostApplyScreen() {
  const { user } = useAuthStore();
  const { applyAsHost, isLoading } = useHostStore();
  const [documents, setDocuments] = useState<string[]>([]);
  const [documentUrl, setDocumentUrl] = useState('');

  const handleAddDocument = () => {
    if (!documentUrl.trim()) {
      Alert.alert('Error', 'Please enter a document URL');
      return;
    }

    if (!documentUrl.startsWith('http')) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setDocuments([...documents, documentUrl]);
    setDocumentUrl('');
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      Alert.alert('Error', 'Please add at least one verification document');
      return;
    }

    try {
      await applyAsHost({ documents });
      Alert.alert(
        'Success',
        'Your application has been submitted successfully. You will be notified once it is reviewed.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  if (user?.isHost) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Already a Host</Title>
            <Paragraph>You are already a verified host!</Paragraph>
            <Button
              mode="contained"
              onPress={() => router.push('/host/dashboard')}
              style={styles.button}
            >
              View Dashboard
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (user?.hostVerificationStatus === 'pending') {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Application Pending</Title>
            <Paragraph>
              Your host application is currently under review. We will notify you once it has been
              processed.
            </Paragraph>
            <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Become a Host</Title>
          <Paragraph>
            As a verified host, you can earn from video and audio calls on Banter!
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Earning Rates</Title>
          <List.Item
            title="Video Calls"
            description="Earn 30% of call revenue"
            left={(props) => <List.Icon {...props} icon="video" />}
          />
          <Divider />
          <List.Item
            title="Audio Calls"
            description="Earn 15% of call revenue"
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Benefits</Title>
          <List.Item
            title="Performance Bonuses"
            description="Earn extra for high ratings and milestones"
            left={(props) => <List.Icon {...props} icon="star" />}
          />
          <Divider />
          <List.Item
            title="Weekly Payouts"
            description="Request withdrawals anytime (min ₹500)"
            left={(props) => <List.Icon {...props} icon="cash" />}
          />
          <Divider />
          <List.Item
            title="Flexible Schedule"
            description="Work on your own time"
            left={(props) => <List.Icon {...props} icon="clock-outline" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Verification Documents</Title>
          <Paragraph style={styles.subtitle}>
            Please provide URLs to your verification documents (ID proof, address proof, etc.)
          </Paragraph>

          <View style={styles.inputContainer}>
            <TextInput
              mode="outlined"
              label="Document URL"
              value={documentUrl}
              onChangeText={setDocumentUrl}
              placeholder="https://example.com/document.pdf"
              style={styles.input}
              disabled={isLoading}
            />
            <IconButton
              icon="plus"
              size={24}
              onPress={handleAddDocument}
              disabled={isLoading}
            />
          </View>

          {documents.length > 0 && (
            <View style={styles.documentsList}>
              <Text variant="titleSmall" style={styles.documentsTitle}>
                Added Documents ({documents.length})
              </Text>
              {documents.map((doc, index) => (
                <View key={index} style={styles.documentItem}>
                  <Text variant="bodyMedium" style={styles.documentText} numberOfLines={1}>
                    {doc}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleRemoveDocument(index)}
                    disabled={isLoading}
                  />
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Important Guidelines</Title>
          <List.Item
            title="Professional Conduct"
            description="Always maintain professionalism during calls"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
          />
          <Divider />
          <List.Item
            title="Zero-Tolerance Policy"
            description="No harassment, hate speech, or inappropriate content"
            left={(props) => <List.Icon {...props} icon="alert" />}
          />
          <Divider />
          <List.Item
            title="Privacy & Security"
            description="Never share personal contact information"
            left={(props) => <List.Icon {...props} icon="lock" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.submitContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading || documents.length === 0}
          style={styles.submitButton}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : 'Submit Application'}
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
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: COLORS.background,
  },
  button: {
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
  },
  documentsList: {
    marginTop: 16,
  },
  documentsTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingLeft: 12,
    marginBottom: 8,
  },
  documentText: {
    flex: 1,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    paddingVertical: 6,
  },
});
