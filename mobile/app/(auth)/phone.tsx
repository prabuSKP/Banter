// mobile/app/(auth)/phone.tsx

import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, ENV } from '../../src/constants';
import firebaseAuthService from '../../src/services/firebase';

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    // Remove spaces and special characters
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Check if it starts with country code
    if (!cleaned.startsWith('+')) {
      return ENV.DEFAULT_COUNTRY_CODE + cleaned;
    }

    return cleaned;
  };

  const handleSendOTP = async () => {
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    const formattedPhone = validatePhoneNumber(phoneNumber);

    // Basic validation
    if (formattedPhone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const confirmation = await firebaseAuthService.sendOTP(formattedPhone);

      // Navigate to verification screen with confirmation
      router.push({
        pathname: '/(auth)/verify',
        params: {
          phoneNumber: formattedPhone,
          confirmationId: 'firebase_confirmation' // We'll pass the confirmation object differently
        },
      });

      // Store confirmation temporarily (in real app, use a better solution)
      (global as any).otpConfirmation = confirmation;
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to {ENV.APP_NAME}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your phone number to get started
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Phone Number"
            placeholder={`${ENV.DEFAULT_COUNTRY_CODE} 9876543210`}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoFocus
            error={!!error}
            disabled={loading}
            left={<TextInput.Affix text={ENV.DEFAULT_COUNTRY_CODE} />}
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSendOTP}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send OTP
          </Button>

          <Text variant="bodySmall" style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  disclaimer: {
    marginTop: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
