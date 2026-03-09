'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TrackingMap from '@/components/map/TrackingMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { Parcel } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function TrackParcelPage() {
  const params = useParams();
  const router = useRouter();
  const parcelId = params?.id as string;
  const user = useAuthStore((state) => state.user);

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parcelId) {
      fetchParcelDetails();
    }
  }, [parcelId]);

  const fetchParcelDetails = async () => {
    try {
      const response = await api.get(`/parcels/${parcelId}`);
      setParcel(response.data.data);
    } catch (error) {
      console.error('Failed to fetch parcel details:', error);
      router.push('/parcels');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Parcel not found</p>
        </CardContent>
      </Card>
    );
  }

  const isTraveler = parcel.matchedTrip?.travelerId === user?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Track Parcel</h2>
          <p className="text-muted-foreground mt-1">
            Real-time location tracking for parcel #{parcel.id}
          </p>
        </div>
      </div>

      {/* Tracking Map */}
      <TrackingMap
        parcelId={parcelId}
        pickupLocation={{
          latitude: parcel.pickupLocation.latitude,
          longitude: parcel.pickupLocation.longitude,
          address: parcel.pickupLocation.address,
        }}
        deliveryLocation={{
          latitude: parcel.deliveryLocation.latitude,
          longitude: parcel.deliveryLocation.longitude,
          address: parcel.deliveryLocation.address,
        }}
        isTraveler={isTraveler}
      />
    </div>
  );
}
