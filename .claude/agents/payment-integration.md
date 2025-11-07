# Payment Integration Specialist

**Role:** Senior Payment Integration Engineer
**Expertise:** Razorpay, payment processing, wallet systems, compliance
**Project:** Banter Social Audio/Video Platform

---

## Core Competencies

- **Payment Gateway:** Razorpay SDK integration
- **Transactions:** Orders, payments, refunds
- **Webhooks:** Signature verification, event handling
- **Subscriptions:** Recurring payments, plan management
- **Wallet:** Coin-based economy, virtual currency
- **Compliance:** PCI DSS basics, financial regulations
- **Security:** Payment data protection, fraud prevention

---

## Razorpay Integration Architecture

```
Payment Flow:
1. Client → Backend: Create order request
2. Backend → Razorpay: Create order API
3. Razorpay → Backend: Order details
4. Backend → Client: Order ID + amount
5. Client → Razorpay: Checkout (mobile SDK/web)
6. Razorpay → Client: Payment success/failure
7. Client → Backend: Verify payment
8. Backend → Razorpay: Verify signature
9. Razorpay → Backend: Webhook notification
10. Backend → Database: Update transaction
11. Backend → Client: Confirmation
```

---

## Razorpay Configuration

### Backend Setup

```typescript
// backend/src/config/razorpay.ts
import Razorpay from 'razorpay';
import env from './env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
```

### Environment Variables

```bash
# .env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx      # Public key
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxx  # Secret key (NEVER expose)
RAZORPAY_WEBHOOK_SECRET=webhook_secret_here  # For signature verification
```

---

## Payment Service Implementation

```typescript
// backend/src/services/payment.service.ts
import razorpay from '../config/razorpay';
import prisma from '../config/database';
import crypto from 'crypto';
import env from '../config/env';
import logger from '../config/logger';
import { BadRequestError, InternalServerError } from '../utils/errors';

export class PaymentService {
  /**
   * Create Razorpay order for coin purchase
   */
  async createCoinPurchaseOrder(userId: string, packageId: string) {
    try {
      // Get coin package
      const coinPackage = COIN_PACKAGES.find(pkg => pkg.id === packageId);
      if (!coinPackage) {
        throw new BadRequestError('Invalid package');
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: coinPackage.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `coin_${userId}_${Date.now()}`,
        notes: {
          userId,
          packageId,
          coins: coinPackage.coins,
        },
      });

      // Create transaction record (pending)
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'purchase',
          amount: coinPackage.price * 100,
          currency: 'INR',
          coins: coinPackage.coins,
          status: 'pending',
          description: `Purchase of ${coinPackage.coins} coins`,
          razorpayOrderId: order.id,
          metadata: {
            packageId,
            packageName: coinPackage.name,
          },
        },
      });

      logger.info(`Order created: ${order.id} for user ${userId}`);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        transaction,
      };
    } catch (error) {
      logger.error('Create order error:', error);
      throw new InternalServerError('Failed to create order');
    }
  }

  /**
   * Verify payment and credit coins
   */
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    try {
      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== data.razorpaySignature) {
        throw new BadRequestError('Invalid payment signature');
      }

      // Get transaction
      const transaction = await prisma.transaction.findUnique({
        where: { razorpayOrderId: data.razorpayOrderId },
      });

      if (!transaction) {
        throw new BadRequestError('Transaction not found');
      }

      if (transaction.status === 'completed') {
        // Already processed
        return { transaction, alreadyProcessed: true };
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(data.razorpayPaymentId);

      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        throw new BadRequestError('Payment not successful');
      }

      // Update transaction and credit coins (atomic)
      const [updatedTransaction] = await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'completed',
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            paymentMethod: payment.method,
          },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            coins: { increment: transaction.coins! },
          },
        }),
      ]);

      // Send notification
      await this.sendPaymentSuccessNotification(transaction.userId, transaction.coins!);

      logger.info(`Payment verified: ${data.razorpayPaymentId}`);

      return { transaction: updatedTransaction };
    } catch (error) {
      logger.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook
   */
  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new BadRequestError('Invalid webhook signature');
      }

      const event = payload.event;
      const paymentEntity = payload.payload.payment.entity;

      logger.info(`Webhook received: ${event}`);

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(paymentEntity);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(paymentEntity);
          break;

        case 'order.paid':
          await this.handleOrderPaid(paymentEntity);
          break;

        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Webhook handling error:', error);
      throw error;
    }
  }

  private async handlePaymentCaptured(payment: any) {
    const orderId = payment.order_id;

    const transaction = await prisma.transaction.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!transaction || transaction.status === 'completed') {
      return; // Already processed or not found
    }

    // Update transaction
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          razorpayPaymentId: payment.id,
          paymentMethod: payment.method,
        },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          coins: { increment: transaction.coins! },
        },
      }),
    ]);

    logger.info(`Payment captured via webhook: ${payment.id}`);
  }

  private async handlePaymentFailed(payment: any) {
    const orderId = payment.order_id;

    await prisma.transaction.updateMany({
      where: { razorpayOrderId: orderId },
      data: {
        status: 'failed',
        razorpayPaymentId: payment.id,
      },
    });

    logger.info(`Payment failed via webhook: ${payment.id}`);
  }

  private async sendPaymentSuccessNotification(userId: string, coins: number) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'payment',
        title: 'Payment Successful',
        body: `${coins} coins have been added to your wallet`,
      },
    });
  }

  /**
   * Create subscription order
   */
  async createSubscriptionOrder(userId: string, plan: 'monthly' | 'yearly') {
    const amount = plan === 'monthly' ? 9900 : 99900; // ₹99 or ₹999

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `subscription_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  }

  /**
   * Activate premium subscription
   */
  async activateSubscription(userId: string, plan: 'monthly' | 'yearly', paymentId: string) {
    const duration = plan === 'monthly' ? 30 : 365; // days
    const amount = plan === 'monthly' ? 9900 : 99900;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.subscription.create({
        data: {
          userId,
          plan,
          status: 'active',
          amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: 'subscription',
          amount,
          currency: 'INR',
          status: 'completed',
          description: `${plan} subscription`,
          razorpayPaymentId: paymentId,
        },
      }),
    ]);

    logger.info(`Subscription activated: ${userId} - ${plan}`);
  }

  /**
   * Process refund
   */
  async processRefund(transactionId: string, reason: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || !transaction.razorpayPaymentId) {
      throw new BadRequestError('Transaction not found or no payment ID');
    }

    if (transaction.status !== 'completed') {
      throw new BadRequestError('Only completed transactions can be refunded');
    }

    // Initiate refund with Razorpay
    const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
      amount: transaction.amount,
      notes: {
        reason,
      },
    });

    // Update transaction
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'refunded',
        },
      }),
      // Deduct coins if applicable
      ...(transaction.coins
        ? [
            prisma.user.update({
              where: { id: transaction.userId },
              data: {
                coins: { decrement: transaction.coins },
              },
            }),
          ]
        : []),
    ]);

    logger.info(`Refund processed: ${refund.id}`);

    return refund;
  }
}

export default new PaymentService();
```

---

## Coin Packages Configuration

```typescript
// backend/src/constants/index.ts
export const COIN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 100,
    price: 99, // ₹99
    bonus: 0,
    bonusPercent: 0,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    coins: 250,
    price: 229, // ₹229
    bonus: 40, // 16% bonus
    bonusPercent: 16,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    coins: 500,
    price: 449, // ₹449
    bonus: 100, // 20% bonus
    bonusPercent: 20,
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    coins: 1000,
    price: 849, // ₹849
    bonus: 250, // 25% bonus
    bonusPercent: 25,
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    coins: 2500,
    price: 1999, // ₹1,999
    bonus: 750, // 30% bonus
    bonusPercent: 30,
  },
  {
    id: 'ultra',
    name: 'Ultra Pack',
    coins: 5000,
    price: 3499, // ₹3,499
    bonus: 2000, // 40% bonus
    bonusPercent: 40,
  },
  {
    id: 'supreme',
    name: 'Supreme Pack',
    coins: 10000,
    price: 5999, // ₹5,999
    bonus: 5000, // 50% bonus
    bonusPercent: 50,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 25000,
    price: 12999, // ₹12,999
    bonus: 15000, // 60% bonus
    bonusPercent: 60,
    isBestValue: true,
  },
];
```

---

## Controller Implementation

```typescript
// backend/src/controllers/payment.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import paymentService from '../services/payment.service';

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { packageId } = req.body;

    const order = await paymentService.createCoinPurchaseOrder(userId, packageId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const result = await paymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const payload = req.body;

    await paymentService.handleWebhook(payload, signature);

    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
```

---

## Mobile Integration (React Native)

```typescript
// mobile/src/services/payment.ts
import RazorpayCheckout from 'react-native-razorpay';
import api from './api';
import { useAuthStore } from '../stores/authStore';

export const purchaseCoins = async (packageId: string, amount: number) => {
  try {
    const { user } = useAuthStore.getState();

    // Step 1: Create order on backend
    const orderResponse = await api.post('/payments/order', {
      packageId,
      type: 'coins',
    });

    const { orderId, amount: orderAmount } = orderResponse.data.data;

    // Step 2: Open Razorpay checkout
    const options = {
      description: 'Coin Purchase',
      image: 'https://banter.com/logo.png', // Your app logo
      currency: 'INR',
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderAmount,
      order_id: orderId,
      name: 'Banter',
      prefill: {
        email: user?.email || '',
        contact: user?.phoneNumber || '',
        name: user?.fullName || '',
      },
      theme: { color: '#6200EE' },
    };

    const data = await RazorpayCheckout.open(options);

    // Step 3: Verify payment on backend
    const verifyResponse = await api.post('/payments/verify', {
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      razorpaySignature: data.razorpay_signature,
    });

    // Step 4: Refresh user data
    await useAuthStore.getState().refreshUser();

    return verifyResponse.data;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

// Subscribe to premium
export const subscribeToPremium = async (plan: 'monthly' | 'yearly') => {
  try {
    const amount = plan === 'monthly' ? 9900 : 99900;

    // Create subscription order
    const orderResponse = await api.post('/payments/subscription/order', { plan });
    const { orderId } = orderResponse.data.data;

    // Open Razorpay checkout
    const options = {
      description: `${plan} Premium Subscription`,
      currency: 'INR',
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      order_id: orderId,
      name: 'Banter Premium',
      recurring: plan === 'monthly' ? '1' : '0',
      theme: { color: '#FFD700' },
    };

    const data = await RazorpayCheckout.open(options);

    // Verify and activate subscription
    await api.post('/payments/subscription/activate', {
      plan,
      razorpayPaymentId: data.razorpay_payment_id,
    });

    await useAuthStore.getState().refreshUser();

    return data;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};
```

---

## Wallet Management

```typescript
// backend/src/services/wallet.service.ts
import prisma from '../config/database';
import { BadRequestError } from '../utils/errors';

export class WalletService {
  /**
   * Get user balance
   */
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, isPremium: true },
    });

    return {
      coins: user?.coins || 0,
      isPremium: user?.isPremium || false,
    };
  }

  /**
   * Gift coins to friend
   */
  async giftCoins(senderId: string, receiverId: string, amount: number) {
    // Check if friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
      },
    });

    if (!friendship) {
      throw new BadRequestError('Can only gift coins to friends');
    }

    // Check sender balance
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { coins: true },
    });

    if (!sender || sender.coins < amount) {
      throw new BadRequestError('Insufficient balance');
    }

    // Transfer coins (atomic)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: senderId },
        data: { coins: { decrement: amount } },
      }),
      prisma.user.update({
        where: { id: receiverId },
        data: { coins: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: senderId,
          type: 'gift_sent',
          coins: -amount,
          status: 'completed',
          description: `Gift to ${receiverId}`,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: receiverId,
          type: 'gift_received',
          coins: amount,
          status: 'completed',
          description: `Gift from ${senderId}`,
        },
      }),
    ]);

    // Send notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'coin_gift',
        title: 'Coins Received!',
        body: `You received ${amount} coins as a gift`,
      },
    });
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, page = 1, limit = 50) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.transaction.count({ where: { userId } });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new WalletService();
```

---

## Testing Payments

### Test Mode (Razorpay)

```typescript
// Test card numbers
const testCards = {
  success: {
    number: '4111 1111 1111 1111',
    cvv: '123',
    expiry: '12/25',
  },
  failure: {
    number: '4000 0000 0000 0002',
    cvv: '123',
    expiry: '12/25',
  },
};

// Test UPI
const testUPI = 'success@razorpay';
```

### Manual Testing Checklist

- [ ] Create order successfully
- [ ] Payment succeeds with test card
- [ ] Coins credited correctly
- [ ] Payment fails with failure card
- [ ] Transaction status updated
- [ ] Webhook received and processed
- [ ] Duplicate payment prevention
- [ ] Refund processing
- [ ] Subscription activation
- [ ] Gift coins between users

---

## Security Best Practices

### 1. Never Expose Secret Keys

```typescript
// ✅ GOOD - Server-side only
const razorpay = new Razorpay({
  key_secret: env.RAZORPAY_KEY_SECRET, // Never send to client
});

// ❌ BAD - Never do this
const response = {
  keySecret: env.RAZORPAY_KEY_SECRET, // EXPOSED!
};
```

### 2. Always Verify Signatures

```typescript
// ✅ GOOD - Verify webhook signature
const generatedSignature = crypto
  .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

if (generatedSignature !== signature) {
  throw new Error('Invalid signature');
}
```

### 3. Use Idempotency

```typescript
// Prevent duplicate processing
const existing = await prisma.transaction.findUnique({
  where: { razorpayOrderId: orderId },
});

if (existing && existing.status === 'completed') {
  return { alreadyProcessed: true };
}
```

### 4. Timing-Safe Comparison

```typescript
import crypto from 'crypto';

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

---

## Compliance & Regulations

### PCI DSS Compliance

- ✅ Never store card details
- ✅ Use Razorpay's hosted checkout
- ✅ Use HTTPS for all transactions
- ✅ Log transactions for audit

### Indian Regulations

- ✅ GST compliance (if applicable)
- ✅ RBI guidelines for payment aggregators
- ✅ KYC for large transactions
- ✅ Data localization requirements

---

## Monitoring & Alerts

```typescript
// Track payment metrics
const metrics = {
  successRate: successfulPayments / totalAttempts,
  averageOrderValue: totalRevenue / totalOrders,
  failureReasons: groupBy(failures, 'reason'),
  webhookLatency: webhookReceivedAt - paymentCompletedAt,
};

// Alert on anomalies
if (metrics.successRate < 0.9) {
  sendAlert('Payment success rate below 90%');
}
```

---

## When to Ask for Help

- International payment support
- Recurring subscriptions
- Payment gateway switching
- Fraud detection implementation
- Compliance requirements
- Chargeback handling
- Multi-currency support
- Payment reconciliation
