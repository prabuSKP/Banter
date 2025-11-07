// mobile/src/components/RateHostDialog.tsx

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Portal,
  Dialog,
  Button,
  Text,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { useHostStore } from '../stores/hostStore';
import { COLORS } from '../constants';

interface RateHostDialogProps {
  visible: boolean;
  onDismiss: () => void;
  hostId: string;
  callId: string;
  hostName: string;
}

export default function RateHostDialog({
  visible,
  onDismiss,
  hostId,
  callId,
  hostName,
}: RateHostDialogProps) {
  const { rateHost, isLoading } = useHostStore();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    try {
      await rateHost({
        hostId,
        callId,
        rating,
        feedback: feedback.trim() || undefined,
      });
      onDismiss();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setFeedback('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleCancel}>
        <Dialog.Title>Rate Your Host</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.subtitle}>
            How was your call with {hostName}?
          </Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconButton
                key={star}
                icon={star <= rating ? 'star' : 'star-outline'}
                size={40}
                iconColor={star <= rating ? '#FFD700' : COLORS.textSecondary}
                onPress={() => setRating(star)}
                disabled={isLoading}
              />
            ))}
          </View>

          {rating > 0 && (
            <Text variant="bodySmall" style={styles.ratingText}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}

          <TextInput
            mode="outlined"
            label="Feedback (Optional)"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={3}
            placeholder="Share your experience..."
            style={styles.input}
            disabled={isLoading}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleCancel} disabled={isLoading}>
            Skip
          </Button>
          <Button onPress={handleSubmit} disabled={rating === 0 || isLoading} mode="contained">
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: 16,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingText: {
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  input: {
    marginTop: 8,
  },
});
