'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ParcelCard from '@/components/dashboard/ParcelCard';
import MatchingParcels from '@/components/dashboard/MatchingParcels';
import { MapPin, Calendar, Package, IndianRupee, Edit, Trash2, Phone, Mail, User as UserIcon, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Trip } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

const statusColors = {
  pending: 'bg-yellow-500',
  matched: 'bg-blue-500',
  in_transit: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-gray-500',
};

const statusLabels = {
  pending: 'Pending',
  matched: 'Matched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    }
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      console.log('Trip details response:', response);
      console.log('Trip data:', response.data);

      // Handle different response structures
      const tripData = response.data?.data || response.data;
      console.log('Extracted trip data:', tripData);

      setTrip(tripData);
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      toast.error('Failed to load trip details');
      router.push('/trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/trips/${tripId}`);
      toast.success('Trip deleted successfully');
      router.push('/trips');
    } catch {
      toast.error('Failed to delete trip');
      setIsDeleting(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/trips/${tripId}/complete`);
      toast.success('Trip marked as completed');
      fetchTripDetails();
    } catch {
      toast.error('Failed to complete trip');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Trip not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {trip.origin?.city || (trip as any).originAddress?.split(',')[0] || 'Origin'} → {trip.destination?.city || (trip as any).destAddress?.split(',')[0] || 'Destination'}
          </h2>
          <p className="text-muted-foreground mt-2">Trip ID: {trip.id}</p>
        </div>
        <Badge className={statusColors[trip.status]}>
          {statusLabels[trip.status]}
        </Badge>
      </div>

      {/* Actions */}
      {trip.status === 'pending' && (
        <div className="flex gap-2">
          <Link href={`/trips/${tripId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}

      {trip.status === 'in_transit' && (
        <Button onClick={handleComplete}>Mark as Completed</Button>
      )}

      {/* Trip Details */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Origin</p>
                  <p className="text-sm text-muted-foreground">
                    {(trip as any).originAddress || trip.origin?.address || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Destination</p>
                  <p className="text-sm text-muted-foreground">
                    {(trip as any).destAddress || trip.destination?.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Departure Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date((trip as any).departureTime || trip.departureDate), 'PPP p')}
                  </p>
                </div>
              </div>

              {((trip as any).arrivalTime || trip.arrivalDate) && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Arrival Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date((trip as any).arrivalTime || trip.arrivalDate), 'PPP p')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Available Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {(trip as any).maxWeight || trip.availableCapacity} kg
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Price per kg</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{(trip as any).basePricePerKg || trip.pricePerKg}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {trip.description && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">{trip.description}</p>
            </div>
          )}

          {trip.restrictions && trip.restrictions.length > 0 && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Restrictions</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {trip.restrictions.map((restriction, index) => (
                  <li key={index}>{restriction}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matched Parcels */}
      {trip.matchedParcels && trip.matchedParcels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matched Parcels ({trip.matchedParcels.length})</CardTitle>
            <CardDescription>Parcels assigned to this trip</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trip.matchedParcels.map((parcel) => (
                <ParcelCard key={parcel.id} parcel={parcel} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sender Contact Information - Show for matched parcels */}
      {(trip.status === 'matched' || trip.status === 'in_transit') && trip.parcels && trip.parcels.length > 0 && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-green-600" />
              Sender Contact Information
            </CardTitle>
            <CardDescription>
              Coordinate pickup and delivery with the parcel sender
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {trip.parcels.map((parcel: any) => (
              <div key={parcel.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                <p className="font-medium mb-3 text-sm text-muted-foreground">
                  Parcel: {parcel.title || parcel.description?.substring(0, 40)}
                </p>
                <div className="grid gap-3 ml-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Recipient</p>
                      <p className="text-sm text-muted-foreground">
                        {parcel.recipientName || `${parcel.sender?.firstName} ${parcel.sender?.lastName}`}
                      </p>
                    </div>
                  </div>

                  {parcel.recipientPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <a
                          href={`tel:${parcel.recipientPhone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {parcel.recipientPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {parcel.recipientEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a
                          href={`mailto:${parcel.recipientEmail}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {parcel.recipientEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link href="/messages">
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Go to Messages
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Parcels - Show available parcels that need delivery on this route */}
      {trip.status === 'pending' && (
        <MatchingParcels
          tripId={trip.id}
          originAddress={(trip as any).originAddress || trip.origin?.address || ''}
          destAddress={(trip as any).destAddress || trip.destination?.address || ''}
        />
      )}
    </div>
  );
}
