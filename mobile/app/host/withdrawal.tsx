// mobile/app/host/withdrawal.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  TextInput,
  RadioButton,
  ActivityIndicator,
  Paragraph,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useHostStore } from '../../src/stores/hostStore';
import { COLORS } from '../../src/constants';

export default function WithdrawalRequestScreen() {
  const { dashboard, requestWithdrawal, isLoading } = useHostStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'upi' | 'bank_transfer' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  const handleSubmit = async () => {
    const withdrawalAmount = parseFloat(amount);

    // Validation
    if (!amount || isNaN(withdrawalAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawalAmount < 500) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹500');
      return;
    }

    if (withdrawalAmount > (dashboard?.availableBalance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (method === 'upi' && !upiId.trim()) {
      Alert.alert('Error', 'Please enter your UPI ID');
      return;
    }

    if (method === 'bank_transfer') {
      if (!accountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim()) {
        Alert.alert('Error', 'Please fill in all bank details');
        return;
      }
    }

    try {
      const paymentDetails: any = {};

      if (method === 'upi') {
        paymentDetails.upiId = upiId;
      } else if (method === 'bank_transfer') {
        paymentDetails.accountNumber = accountNumber;
        paymentDetails.ifscCode = ifscCode;
        paymentDetails.accountHolderName = accountHolderName;
      }

      await requestWithdrawal({
        amount: withdrawalAmount,
        method,
        paymentDetails,
      });

      Alert.alert(
        'Success',
        'Withdrawal request submitted successfully. It will be processed within 3-5 business days.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit withdrawal request');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Available Balance</Title>
          <Text variant="headlineLarge" style={styles.balance}>
            ₹{dashboard?.availableBalance?.toFixed(2) || '0.00'}
          </Text>
          <Paragraph style={styles.minAmountText}>
            Minimum withdrawal amount: ₹500
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Withdrawal Amount</Title>
          <TextInput
            mode="outlined"
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
            style={styles.input}
            disabled={isLoading}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Payment Method</Title>

          <RadioButton.Group onValueChange={(value) => setMethod(value as any)} value={method}>
            <View style={styles.radioItem}>
              <RadioButton.Item label="UPI" value="upi" disabled={isLoading} />
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Item label="Bank Transfer" value="bank_transfer" disabled={isLoading} />
            </View>
            <View style={styles.radioItem}>
              <RadioButton.Item label="Wallet" value="wallet" disabled={isLoading} />
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {method === 'upi' && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>UPI Details</Title>
            <TextInput
              mode="outlined"
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="username@upi"
              style={styles.input}
              disabled={isLoading}
            />
          </Card.Content>
        </Card>
      )}

      {method === 'bank_transfer' && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Bank Details</Title>
            <TextInput
              mode="outlined"
              label="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="Full name as per bank account"
              style={styles.input}
              disabled={isLoading}
            />
            <TextInput
              mode="outlined"
              label="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              placeholder="Enter account number"
              style={styles.input}
              disabled={isLoading}
            />
            <TextInput
              mode="outlined"
              label="IFSC Code"
              value={ifscCode}
              onChangeText={setIfscCode}
              placeholder="Enter IFSC code"
              style={styles.input}
              disabled={isLoading}
              autoCapitalize="characters"
            />
          </Card.Content>
        </Card>
      )}

      {method === 'wallet' && (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>
              The amount will be credited to your in-app wallet and can be used for calls and other
              features.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Important Information</Title>
          <Paragraph style={styles.infoText}>
            • Withdrawals are processed within 3-5 business days
          </Paragraph>
          <Paragraph style={styles.infoText}>
            • A processing fee may apply based on the payment method
          </Paragraph>
          <Paragraph style={styles.infoText}>
            • Please ensure your payment details are correct
          </Paragraph>
          <Paragraph style={styles.infoText}>
            • You will receive a notification once your withdrawal is processed
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.submitContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : 'Submit Withdrawal Request'}
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
  balance: {
    marginTop: 8,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  minAmountText: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  input: {
    marginTop: 12,
  },
  radioItem: {
    marginVertical: 4,
  },
  infoText: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    paddingVertical: 6,
  },
});
