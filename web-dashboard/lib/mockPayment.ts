// Mock Payment Gateway
// This simulates a payment provider like Stripe without external dependencies

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  createdAt: Date;
  paymentMethodId?: string;
}

// Simulate payment processing delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock IDs
const generateId = (prefix: string) => {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
};

class MockPaymentGateway {
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  // Create a payment intent
  async createPaymentIntent(amount: number, currency: string = 'INR'): Promise<PaymentIntent> {
    await delay(500); // Simulate network delay

    const intent: PaymentIntent = {
      id: generateId('pi'),
      amount,
      currency,
      status: 'pending',
      createdAt: new Date(),
    };

    this.paymentIntents.set(intent.id, intent);
    return intent;
  }

  // Add a payment method (card)
  async addPaymentMethod(
    cardNumber: string,
    expiryMonth: number,
    expiryYear: number,
    cvv: string
  ): Promise<PaymentMethod> {
    await delay(300);

    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      throw new Error('Invalid card number');
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      throw new Error('Invalid expiry month');
    }

    if (expiryYear < new Date().getFullYear()) {
      throw new Error('Card has expired');
    }

    if (cvv.length < 3 || cvv.length > 4) {
      throw new Error('Invalid CVV');
    }

    // Determine card brand
    let brand = 'Unknown';
    const firstDigit = cardNumber[0];
    if (firstDigit === '4') brand = 'Visa';
    else if (firstDigit === '5') brand = 'Mastercard';
    else if (firstDigit === '3') brand = 'Amex';
    else if (firstDigit === '6') brand = 'Discover';

    const paymentMethod: PaymentMethod = {
      id: generateId('pm'),
      type: 'card',
      last4: cardNumber.slice(-4),
      brand,
      expiryMonth,
      expiryYear,
    };

    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  // Confirm a payment
  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    await delay(1000); // Simulate processing

    const intent = this.paymentIntents.get(paymentIntentId);
    if (!intent) {
      throw new Error('Payment intent not found');
    }

    const paymentMethod = this.paymentMethods.get(paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    // 95% success rate (5% random failures for testing)
    const success = Math.random() > 0.05;

    const updatedIntent: PaymentIntent = {
      ...intent,
      status: success ? 'succeeded' : 'failed',
      paymentMethodId,
    };

    this.paymentIntents.set(paymentIntentId, updatedIntent);
    return updatedIntent;
  }

  // Get payment intent
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    await delay(200);
    return this.paymentIntents.get(paymentIntentId) || null;
  }

  // Cancel payment intent
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    await delay(300);

    const intent = this.paymentIntents.get(paymentIntentId);
    if (!intent) {
      throw new Error('Payment intent not found');
    }

    const updatedIntent: PaymentIntent = {
      ...intent,
      status: 'canceled',
    };

    this.paymentIntents.set(paymentIntentId, updatedIntent);
    return updatedIntent;
  }

  // Simulate escrow hold
  async holdPayment(paymentIntentId: string): Promise<void> {
    await delay(500);
    // In a real system, this would place funds in escrow
    console.log(`Payment ${paymentIntentId} held in escrow`);
  }

  // Simulate escrow release
  async releasePayment(paymentIntentId: string): Promise<void> {
    await delay(500);
    // In a real system, this would release funds to the recipient
    console.log(`Payment ${paymentIntentId} released from escrow`);
  }

  // Simulate refund
  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    await delay(800);
    const intent = this.paymentIntents.get(paymentIntentId);
    if (!intent) {
      throw new Error('Payment intent not found');
    }
    console.log(`Refunded ${amount || intent.amount} for payment ${paymentIntentId}`);
  }
}

// Export singleton instance
export const mockPaymentGateway = new MockPaymentGateway();

// Test card numbers (for development)
export const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
};
