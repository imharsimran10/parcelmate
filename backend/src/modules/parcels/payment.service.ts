import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // Test card numbers for dummy payment gateway
  private readonly TEST_CARDS = {
    SUCCESS: '4242424242424242', // Visa - Success
    DECLINED: '4000000000000002', // Visa - Declined
    INSUFFICIENT: '4000000000009995', // Visa - Insufficient funds
    INVALID: '4000000000000127', // Visa - Invalid card
  };

  // Process dummy payment
  async processDummyPayment(
    parcelId: string,
    senderId: string,
    cardNumber: string,
    cardExpiry: string,
    cardCvv: string,
    cardName: string,
  ) {
    // Validate card number format
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      throw new BadRequestException('Invalid card number format');
    }

    // Validate expiry format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      throw new BadRequestException('Invalid expiry format. Use MM/YY');
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cardCvv)) {
      throw new BadRequestException('Invalid CVV');
    }

    // Get parcel details
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        trip: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.senderId !== senderId) {
      throw new BadRequestException('You are not authorized to pay for this parcel');
    }

    // Simulate payment processing
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    let paymentStatus: 'COMPLETED' | 'FAILED' = 'COMPLETED';
    let failureReason: string | null = null;

    // Check test card scenarios
    if (cleanCardNumber === this.TEST_CARDS.DECLINED) {
      paymentStatus = 'FAILED';
      failureReason = 'Card declined';
    } else if (cleanCardNumber === this.TEST_CARDS.INSUFFICIENT) {
      paymentStatus = 'FAILED';
      failureReason = 'Insufficient funds';
    } else if (cleanCardNumber === this.TEST_CARDS.INVALID) {
      paymentStatus = 'FAILED';
      failureReason = 'Invalid card';
    }

    if (paymentStatus === 'FAILED') {
      throw new BadRequestException(failureReason);
    }

    // Calculate fees
    const parcelFee = parcel.offeredPrice;
    const platformFee = parcelFee * 0.05; // 5% platform fee
    const processingFee = parcelFee * 0.029 + 0.30; // 2.9% + $0.30
    const totalAmount = parcelFee + platformFee + processingFee;

    // Get card brand
    const cardBrand = this.getCardBrand(cleanCardNumber);
    const cardLast4 = cleanCardNumber.slice(-4);

    // Create or update payment record
    const payment = await this.prisma.payment.upsert({
      where: { parcelId },
      create: {
        parcelId,
        senderId,
        travelerId: parcel.trip?.userId,
        parcelFee,
        platformFee,
        processingFee,
        totalAmount,
        paymentMethod: 'CARD',
        cardBrand,
        cardLast4,
        status: 'ESCROWED', // Money is held in escrow until delivery
        escrowedAt: new Date(),
        stripePaymentIntentId: `pi_test_${this.generateRandomId()}`, // Dummy payment intent ID
      },
      update: {
        status: 'ESCROWED',
        escrowedAt: new Date(),
        paymentMethod: 'CARD',
        cardBrand,
        cardLast4,
        stripePaymentIntentId: `pi_test_${this.generateRandomId()}`,
      },
    });

    // Update parcel status if currently MATCHED
    if (parcel.status === 'MATCHED') {
      await this.prisma.parcel.update({
        where: { id: parcelId },
        data: {
          status: 'MATCHED', // Keep as MATCHED, will be updated when picked up
        },
      });
    }

    return {
      success: true,
      message: 'Payment processed successfully. Amount held in escrow until delivery.',
      payment: {
        id: payment.id,
        amount: totalAmount,
        status: payment.status,
        cardBrand,
        cardLast4,
        breakdown: {
          parcelFee,
          platformFee,
          processingFee,
          total: totalAmount,
        },
      },
    };
  }

  // Get payment status for a parcel
  async getPaymentStatus(parcelId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { parcelId },
      include: {
        parcel: {
          select: {
            title: true,
            status: true,
            deliveredAt: true,
          },
        },
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return {
        paid: false,
        message: 'No payment found for this parcel',
      };
    }

    return {
      paid: true,
      payment: {
        id: payment.id,
        amount: payment.totalAmount,
        status: payment.status,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
        escrowedAt: payment.escrowedAt,
        releasedAt: payment.fullyReleasedAt,
        parcelStatus: payment.parcel.status,
        deliveredAt: payment.parcel.deliveredAt,
      },
    };
  }

  // Get card brand from card number
  private getCardBrand(cardNumber: string): string {
    if (/^4/.test(cardNumber)) return 'VISA';
    if (/^5[1-5]/.test(cardNumber)) return 'MASTERCARD';
    if (/^3[47]/.test(cardNumber)) return 'AMEX';
    if (/^6(?:011|5)/.test(cardNumber)) return 'DISCOVER';
    return 'UNKNOWN';
  }

  // Generate random ID for test payment intent
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
