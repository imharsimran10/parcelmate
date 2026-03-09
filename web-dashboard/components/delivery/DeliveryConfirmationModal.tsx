'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle, Package, MapPin, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface DeliveryConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  parcel: any;
  onSuccess?: () => void;
}

export default function DeliveryConfirmationModal({
  open,
  onClose,
  parcel,
  onSuccess,
}: DeliveryConfirmationModalProps) {
  const [step, setStep] = useState<'initial' | 'generate-otp' | 'verify-otp' | 'success'>('initial');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<any>(null);

  const handleMarkPickedUp = async () => {
    try {
      setIsLoading(true);
      await api.post(`/parcels/${parcel.id}/mark-picked-up`);
      toast.success('Parcel marked as picked up!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as picked up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkInTransit = async () => {
    try {
      setIsLoading(true);
      await api.post(`/parcels/${parcel.id}/mark-in-transit`);
      toast.success('Parcel marked as in transit!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as in transit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOTP = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/parcels/${parcel.id}/generate-delivery-otp`);
      setRecipientInfo(response.data);
      setStep('verify-otp');
      toast.success('Delivery OTP sent to recipient!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      await api.post(`/parcels/${parcel.id}/verify-delivery-otp`, { otp });
      setStep('success');
      toast.success('Delivery confirmed! Payment released.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'generate-otp':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Ready to Deliver?</h3>
              <p className="text-sm text-muted-foreground">
                Generate OTP to confirm delivery with recipient
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{parcel.title}</p>
                  <p className="text-xs text-muted-foreground">{parcel.description}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">{parcel.deliveryAddress}</p>
              </div>
            </div>

            <Button
              onClick={handleGenerateOTP}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating OTP...
                </>
              ) : (
                'Generate Delivery OTP'
              )}
            </Button>
          </div>
        );

      case 'verify-otp':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Enter Delivery OTP</h3>
              <p className="text-sm text-muted-foreground">
                OTP sent to recipient: {recipientInfo?.recipientName}
              </p>
              <p className="text-xs text-muted-foreground">
                Ending with ****{recipientInfo?.recipientPhone}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                Ask the recipient for the 6-digit code
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('generate-otp')}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Confirm Delivery'
                )}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-xl">Delivery Confirmed!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Payment has been released to your account
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{parcel.title}</p>
                  <p className="text-xs text-muted-foreground">{parcel.description}</p>
                </div>
                <Badge>{parcel.status}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Delivery Steps</h4>
              {parcel.status === 'MATCHED' && (
                <Button
                  onClick={handleMarkPickedUp}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Mark as Picked Up
                    </>
                  )}
                </Button>
              )}

              {parcel.status === 'PICKED_UP' && (
                <Button
                  onClick={handleMarkInTransit}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Mark as In Transit
                    </>
                  )}
                </Button>
              )}

              {parcel.status === 'IN_TRANSIT' && (
                <Button
                  onClick={() => setStep('generate-otp')}
                  className="w-full"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Delivery with OTP
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delivery Confirmation</DialogTitle>
          <DialogDescription>
            Complete the delivery process step by step
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
