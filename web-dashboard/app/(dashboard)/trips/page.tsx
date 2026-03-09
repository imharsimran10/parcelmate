'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TripCard from '@/components/dashboard/TripCard';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Trip } from '@/types';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [searchQuery, statusFilter, trips]);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = [...trips];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.origin.city.toLowerCase().includes(query) ||
          trip.origin.country.toLowerCase().includes(query) ||
          trip.destination.city.toLowerCase().includes(query) ||
          trip.destination.country.toLowerCase().includes(query)
      );
    }

    setFilteredTrips(filtered);
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'matched', label: 'Matched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Trips</h2>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming and past trips
          </p>
        </div>
        <Link href="/trips/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Trip
          </Button>
        </Link>
      </div>

      {trips.length > 0 ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2 flex-wrap">
                    {statuses.map((status) => (
                      <Badge
                        key={status.value}
                        variant={statusFilter === status.value ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setStatusFilter(status.value)}
                      >
                        {status.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {filteredTrips.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No trips found matching your filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No trips yet</CardTitle>
            <CardDescription>
              Start by creating your first trip to earn money delivering parcels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/trips/new">
              <Button>Create Your First Trip</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
