'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plane, IndianRupee, Star, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface UserStatistics {
  id: string;
  trustScore: number;
  completedTrips: number;
  completedDeliveries: number;
  averageRating: number | null;
  responseTime: number | null;
  totalEarnings: number;
  receivedReviews: number;
  givenReviews: number;
}

export default function OverviewPage() {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Set default zero values for new users
        setStats({
          id: user?.id || '',
          trustScore: 0,
          completedTrips: 0,
          completedDeliveries: 0,
          averageRating: null,
          responseTime: null,
          totalEarnings: 0,
          receivedReviews: 0,
          givenReviews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-muted-foreground mt-2">
          Here&apos;s what&apos;s happening with your {role === 'traveler' ? 'trips' : 'parcels'} today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === 'traveler' ? 'Total Trips' : 'Total Parcels'}
            </CardTitle>
            {role === 'traveler' ? (
              <Plane className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.completedTrips || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedTrips === 0 ? 'No trips yet' : 'Completed trips'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Deliveries
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedDeliveries || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedDeliveries === 0 ? 'No deliveries yet' : 'Total deliveries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {role === 'traveler' ? 'Total Earnings' : 'Total Spent'}
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats?.totalEarnings || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalEarnings === 0 ? 'No earnings yet' : 'Total amount'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.receivedReviews === 0
                ? 'No reviews yet'
                : `Based on ${stats?.receivedReviews} reviews`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest {role === 'traveler' ? 'trips' : 'parcels'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No recent activity. Start by creating a new {role === 'traveler' ? 'trip' : 'parcel'}!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Matches</CardTitle>
            <CardDescription>
              {role === 'traveler' ? 'Parcels that match your trips' : 'Trips that match your parcels'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No matches available yet. Check back soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
