'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ParcelCard from '@/components/dashboard/ParcelCard';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { Parcel } from '@/types';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchParcels();
  }, []);

  useEffect(() => {
    filterParcels();
  }, [searchQuery, statusFilter, parcels]);

  const fetchParcels = async () => {
    try {
      const response = await api.get('/parcels', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      setParcels(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
      setParcels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterParcels = () => {
    let filtered = [...parcels];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((parcel) => parcel.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (parcel) =>
          parcel.pickupLocation.city.toLowerCase().includes(query) ||
          parcel.pickupLocation.country.toLowerCase().includes(query) ||
          parcel.deliveryLocation.city.toLowerCase().includes(query) ||
          parcel.deliveryLocation.country.toLowerCase().includes(query) ||
          parcel.category.toLowerCase().includes(query) ||
          parcel.description.toLowerCase().includes(query)
      );
    }

    setFilteredParcels(filtered);
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'REQUESTING', label: 'Requesting' },
    { value: 'MATCHED', label: 'Matched' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'DISPUTED', label: 'Disputed' },
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
          <h2 className="text-3xl font-bold tracking-tight">My Parcels</h2>
          <p className="text-muted-foreground mt-2">
            Manage your parcel delivery requests
          </p>
        </div>
        <Link href="/parcels/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Parcel
          </Button>
        </Link>
      </div>

      {parcels.length > 0 ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by location or category..."
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
          {filteredParcels.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No parcels found matching your filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No parcels yet</CardTitle>
            <CardDescription>
              Start by creating a parcel delivery request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/parcels/new">
              <Button>Create Your First Parcel</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
