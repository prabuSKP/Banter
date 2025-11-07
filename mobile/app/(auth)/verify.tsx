// mobile/app/(auth)/verify.tsx

import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants';
import firebaseAuthService from '../../src/services/firebase';
import authService from '../../src/services/auth';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerifyOTP = async () => {
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Get the confirmation object
      const confirmation = (global as any).otpConfirmation;

      if (!confirmation) {
        setError('Session expired. Please request OTP again.');
        router.back();
        return;
      }

      // Verify OTP with Firebase
      const { idToken } = await firebaseAuthService.verifyOTP(confirmation, otp);

      // Login to backend with Firebase ID token
      await authService.login(idToken);

      // Navigate to main app
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setResending(true);

    try {
      const confirmation = await firebaseAuthService.sendOTP(phoneNumber);
      (global as any).otpConfirmation = confirmation;
      setOtp('');
      // Show success message
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
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
            Verify OTP
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text variant="bodyLarge" style={styles.phoneNumber}>
            {phoneNumber}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="OTP Code"
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            error={!!error}
            disabled={loading}
            style={styles.input}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={loading || resending}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify & Continue
          </Button>

          <View style={styles.resendContainer}>
            <Text variant="bodyMedium" style={styles.resendText}>
              Didn't receive the code?
            </Text>
            <Button
              mode="text"
              onPress={handleResendOTP}
              loading={resending}
              disabled={loading || resending}
              compact
            >
              Resend OTP
            </Button>
          </View>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={loading || resending}
            style={styles.backButton}
          >
            Change Phone Number
          </Button>
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
  phoneNumber: {
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    marginTop: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: COLORS.textSecondary,
  },
  backButton: {
    marginTop: 16,
  },
});
