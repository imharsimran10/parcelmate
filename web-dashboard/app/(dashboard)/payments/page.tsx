'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentCard from '@/components/payment/PaymentCard';
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/api';
import { Payment } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEarnings = payments
      .filter((p) => p.status === 'released')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalSpent = payments
      .filter((p) => p.status !== 'failed' && p.status !== 'refunded')
      .reduce((sum, p) => sum + p.amount, 0);

    const heldInEscrow = payments
      .filter((p) => p.status === 'held')
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalEarnings, totalSpent, heldInEscrow };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground mt-2">
          {role === 'traveler' ? 'Track your earnings' : 'View your payment history'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {role === 'traveler' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Released payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.heldInEscrow.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Awaiting delivery confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge variant="secondary">
                  {payments.filter((p) => p.status === 'pending').length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{payments
                    .filter((p) => p.status === 'pending')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.heldInEscrow.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Protected by escrow</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Badge variant="default">
                  {payments.filter((p) => p.status === 'released').length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{stats.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Released to travelers</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Payment List */}
      {payments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View all your payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No payments yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
