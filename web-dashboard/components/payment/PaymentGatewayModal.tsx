'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PaymentGatewayModalProps {
  open: boolean;
  onClose: () => void;
  parcel: any;
  amount: number;
  onSuccess?: () => void;
}

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa', result: 'Success' },
  { number: '4000 0000 0000 0002', brand: 'Visa', result: 'Declined' },
  { number: '4000 0000 0000 9995', brand: 'Visa', result: 'Insufficient Funds' },
];

export default function PaymentGatewayModal({
  open,
  onClose,
  parcel,
  amount,
  onSuccess,
}: PaymentGatewayModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardExpiry(formatExpiry(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardCvv(value);
    }
  };

  const useTestCard = (testCard: typeof TEST_CARDS[0]) => {
    setCardNumber(testCard.number);
    setCardExpiry('12/25');
    setCardCvv('123');
    setCardName('Test User');
  };

  const handlePayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error('Please fill in all card details');
      return;
    }

    try {
      setIsLoading(true);
      await api.post(`/parcels/${parcel.id}/process-payment`, {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardExpiry,
        cardCvv,
        cardName,
      });

      setPaymentSuccess(true);
      toast.success('Payment successful! Amount held in escrow until delivery.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const platformFee = amount * 0.05;
  const processingFee = amount * 0.029 + 0.30;
  const total = amount + platformFee + processingFee;

  if (paymentSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-xl">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                ₹{total.toFixed(2)} held in escrow
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Payment will be released to traveler upon delivery confirmation
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Secure Payment
          </DialogTitle>
          <DialogDescription>
            Enter your card details to complete payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Breakdown */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Parcel Fee</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (5%)</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span>₹{processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Test Cards */}
          <div>
            <Label className="text-xs text-muted-foreground">Test Cards (Click to use)</Label>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {TEST_CARDS.map((card, index) => (
                <button
                  key={index}
                  onClick={() => useTestCard(card)}
                  className="text-left p-2 rounded border hover:bg-muted transition-colors text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{card.number}</span>
                    <span className={`text-xs ${
                      card.result === 'Success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.result}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="pl-10"
                  maxLength={19}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                <Input
                  id="cardExpiry"
                  placeholder="12/25"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardCvv">CVV</Label>
                <Input
                  id="cardCvv"
                  type="password"
                  placeholder="123"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="JOHN DOE"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Your payment is secured. Amount will be held in escrow and released to traveler upon successful delivery.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ₹{total.toFixed(2)}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
