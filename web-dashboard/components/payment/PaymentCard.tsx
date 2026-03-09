import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/types';
import { IndianRupee, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentCardProps {
  payment: Payment;
}

const statusColors = {
  pending: 'bg-yellow-500',
  held: 'bg-blue-500',
  released: 'bg-green-500',
  refunded: 'bg-gray-500',
  failed: 'bg-red-500',
};

const statusLabels = {
  pending: 'Pending',
  held: 'Held in Escrow',
  released: 'Released',
  refunded: 'Refunded',
  failed: 'Failed',
};

export default function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Payment #{payment.id.slice(0, 8)}</CardTitle>
          <Badge className={statusColors[payment.status]}>
            {statusLabels[payment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Amount</span>
          </div>
          <span className="font-semibold text-lg">
            ₹{payment.amount.toFixed(2)} {payment.currency}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Created</span>
          </div>
          <span className="text-sm">{format(new Date(payment.createdAt), 'PPp')}</span>
        </div>

        {payment.status === 'held' && (
          <div className="flex items-start gap-2 pt-2 border-t">
            <Shield className="h-4 w-4 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Escrow Protection Active</p>
              <p className="text-xs text-muted-foreground">
                Funds will be released upon delivery confirmation
              </p>
            </div>
          </div>
        )}

        {payment.releasedAt && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Released</span>
            </div>
            <span className="text-sm">{format(new Date(payment.releasedAt), 'PPp')}</span>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Transaction ID: {payment.stripePaymentIntentId}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
