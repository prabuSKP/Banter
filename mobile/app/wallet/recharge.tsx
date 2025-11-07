// mobile/app/wallet/recharge.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import RazorpayCheckout from 'react-native-razorpay';
import { useWalletStore } from '../../src/stores/walletStore';
import paymentService from '../../src/services/payment';
import { useAuthStore } from '../../src/stores/authStore';

export default function RechargeScreen() {
  const { packages, isLoading, fetchPackages, refreshWallet } = useWalletStore();
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackage(packageId);
  };

  const handleProceedToPayment = async () => {
    if (selectedPackage === null) {
      Alert.alert('Error', 'Please select a recharge package');
      return;
    }

    const pkg = packages[selectedPackage];
    setProcessing(true);

    try {
      // Create order on backend
      const order = await paymentService.createCoinOrder(selectedPackage, pkg.amount);

      // Razorpay options
      const options = {
        description: `Recharge ${pkg.totalCoins} coins`,
        image: 'https://your-app-logo-url.com/logo.png', // TODO: Add your app logo URL
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID, // Add to .env
        amount: pkg.amount * 100, // Convert to paise
        name: 'Banter',
        order_id: order.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phoneNumber || '',
          name: user?.fullName || '',
        },
        theme: { color: '#6200EE' },
      };

      // Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // Payment successful
          try {
            // Verify payment on backend
            await paymentService.verifyPayment({
              razorpayOrderId: data.razorpay_order_id,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpaySignature: data.razorpay_signature,
            });

            // Refresh wallet
            await refreshWallet();

            Alert.alert(
              'Success!',
              `${pkg.totalCoins} coins have been added to your wallet`,
              [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]
            );
          } catch (verifyError: any) {
            Alert.alert('Error', 'Payment verification failed. Please contact support.');
          }
          setProcessing(false);
        })
        .catch((error: any) => {
          // Payment failed or cancelled
          if (error.code !== 0) {
            // 0 means user cancelled
            Alert.alert('Payment Failed', error.description || 'Please try again');
          }
          setProcessing(false);
        });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Choose Recharge Package
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select a package to add coins to your wallet
        </Text>
      </View>

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const isBestValue = pkg.bonus >= 1500; // Highlight packages with best bonus
          const isPopular = pkg.coins === 2000; // Mark popular package

          return (
            <Card
              key={pkg.id}
              style={[
                styles.packageCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => handleSelectPackage(pkg.id)}
            >
              {isBestValue && (
                <View style={styles.badge}>
                  <Chip
                    mode="flat"
                    textStyle={styles.badgeText}
                    style={styles.bestValueChip}
                  >
                    Best Value
                  </Chip>
                </View>
              )}

              {isPopular && !isBestValue && (
                <View style={styles.badge}>
                  <Chip
                    mode="flat"
                    textStyle={styles.badgeText}
                    style={styles.popularChip}
                  >
                    Popular
                  </Chip>
                </View>
              )}

              <Card.Content>
                <View style={styles.packageHeader}>
                  <View>
                    <Text variant="headlineMedium" style={styles.coinsAmount}>
                      {pkg.totalCoins}
                    </Text>
                    <Text variant="bodySmall" style={styles.coinsLabel}>
                      coins
                    </Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text variant="headlineSmall" style={styles.price}>
                      ₹{pkg.amount}
                    </Text>
                  </View>
                </View>

                {pkg.bonus > 0 && (
                  <Chip
                    icon="gift"
                    style={styles.bonusChip}
                    textStyle={styles.bonusText}
                  >
                    +{pkg.bonus} Bonus Coins ({pkg.savings})
                  </Chip>
                )}

                <View style={styles.details}>
                  <Text variant="bodySmall" style={styles.detailText}>
                    Base: {pkg.coins} coins
                  </Text>
                  <Text variant="bodySmall" style={styles.detailText}>
                    ₹{pkg.perCoinCost.toFixed(2)} per coin
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleProceedToPayment}
          disabled={selectedPackage === null || processing}
          loading={processing}
          style={styles.payButton}
        >
          {selectedPackage !== null
            ? `Pay ₹${packages[selectedPackage]?.amount}`
            : 'Select a Package'}
        </Button>

        <Text variant="bodySmall" style={styles.note}>
          Secure payment powered by Razorpay
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  packagesContainer: {
    padding: 16,
    gap: 12,
  },
  packageCard: {
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#6200EE',
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  bestValueChip: {
    backgroundColor: '#4CAF50',
  },
  popularChip: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coinsAmount: {
    fontWeight: 'bold',
    color: '#6200EE',
  },
  coinsLabel: {
    opacity: 0.7,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: 'bold',
  },
  bonusChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    marginBottom: 8,
  },
  bonusText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailText: {
    opacity: 0.6,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    marginBottom: 12,
  },
  note: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
