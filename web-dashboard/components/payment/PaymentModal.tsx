'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockPaymentGateway, TEST_CARDS } from '@/lib/mockPayment';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^\d+$/, 'Card number must contain only digits'),
  expiryMonth: z
    .number()
    .min(1, 'Invalid month')
    .max(12, 'Invalid month'),
  expiryYear: z
    .number()
    .min(new Date().getFullYear(), 'Card has expired'),
  cvv: z
    .string()
    .min(3, 'CVV must be 3-4 digits')
    .max(4, 'CVV must be 3-4 digits')
    .regex(/^\d+$/, 'CVV must contain only digits'),
  cardholderName: z.string().min(3, 'Cardholder name is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  parcelId: string;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentModal({
  open,
  onClose,
  parcelId,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTestCards, setShowTestCards] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      expiryMonth: new Date().getMonth() + 1,
      expiryYear: new Date().getFullYear() + 1,
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);

    try {
      // Step 1: Create payment intent via backend
      const intentResponse = await api.post('/payments/create-intent', {
        parcelId,
        amount,
      });
      const { paymentIntentId } = intentResponse.data.data;

      // Step 2: Add payment method to mock gateway
      const paymentMethod = await mockPaymentGateway.addPaymentMethod(
        data.cardNumber,
        data.expiryMonth,
        data.expiryYear,
        data.cvv
      );

      // Step 3: Confirm payment with mock gateway
      const paymentIntent = await mockPaymentGateway.confirmPayment(
        paymentIntentId,
        paymentMethod.id
      );

      if (paymentIntent.status === 'succeeded') {
        // Step 4: Notify backend of successful payment
        await api.post('/payments/confirm', {
          parcelId,
          paymentIntentId,
          paymentMethodId: paymentMethod.id,
        });

        toast.success('Payment successful! Funds held in escrow.');
        onSuccess?.();
        onClose();
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fillTestCard = (cardNumber: string) => {
    setValue('cardNumber', cardNumber);
    setValue('expiryMonth', 12);
    setValue('expiryYear', 2025);
    setValue('cvv', '123');
    setValue('cardholderName', 'Test User');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Securely process your payment of ₹{amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Escrow Notice */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Escrow Protection:</strong> Your payment will be held securely until
                delivery is confirmed. The traveler will only receive payment after successful delivery.
              </div>
            </div>
          </div>

          {/* Test Cards Toggle */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">Mock Payment Gateway</Badge>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setShowTestCards(!showTestCards)}
            >
              {showTestCards ? 'Hide' : 'Show'} Test Cards
            </Button>
          </div>

          {/* Test Cards */}
          {showTestCards && (
            <div className="bg-muted rounded-md p-3 space-y-2">
              <p className="text-xs font-medium">Test Card Numbers:</p>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1"
                  onClick={() => fillTestCard(TEST_CARDS.SUCCESS)}
                >
                  <Badge variant="default" className="mr-2">Success</Badge>
                  {TEST_CARDS.SUCCESS}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1"
                  onClick={() => fillTestCard(TEST_CARDS.DECLINED)}
                >
                  <Badge variant="destructive" className="mr-2">Declined</Badge>
                  {TEST_CARDS.DECLINED}
                </Button>
              </div>
            </div>
          )}

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              {...register('cardNumber')}
            />
            {errors.cardNumber && (
              <p className="text-sm text-destructive">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              {...register('cardholderName')}
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                type="number"
                min="1"
                max="12"
                placeholder="12"
                {...register('expiryMonth', { valueAsNumber: true })}
              />
              {errors.expiryMonth && (
                <p className="text-xs text-destructive">{errors.expiryMonth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                type="number"
                min={new Date().getFullYear()}
                placeholder="2025"
                {...register('expiryYear', { valueAsNumber: true })}
              />
              {errors.expiryYear && (
                <p className="text-xs text-destructive">{errors.expiryYear.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                maxLength={4}
                {...register('cvv')}
              />
              {errors.cvv && (
                <p className="text-xs text-destructive">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mt-0.5" />
            <span>Your payment information is encrypted and secure.</span>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
