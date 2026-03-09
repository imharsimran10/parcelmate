'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TripCard from '@/components/dashboard/TripCard';
import MatchingTrips from '@/components/dashboard/MatchingTrips';
import PaymentModal from '@/components/payment/PaymentModal';
import { MapPin, Package, IndianRupee, Weight, Edit, Trash2, Navigation, CreditCard, Phone, Mail, User as UserIcon, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { Parcel } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

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

export default function ParcelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const parcelId = params?.id as string;
  const user = useAuthStore((state) => state.user);

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (parcelId) {
      fetchParcelDetails();
    }
  }, [parcelId]);

  const fetchParcelDetails = async () => {
    try {
      const response = await api.get(`/parcels/${parcelId}`);
      console.log('Parcel details response:', response);
      console.log('Parcel data:', response.data);

      // Handle different response structures
      const parcelData = response.data?.data || response.data;
      console.log('Extracted parcel data:', parcelData);

      setParcel(parcelData);
    } catch (error) {
      console.error('Failed to fetch parcel details:', error);
      toast.error('Failed to load parcel details');
      router.push('/parcels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this parcel?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/parcels/${parcelId}`);
      toast.success('Parcel deleted successfully');
      router.push('/parcels');
    } catch {
      toast.error('Failed to delete parcel');
      setIsDeleting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      await api.patch(`/parcels/${parcelId}/confirm-delivery`);
      toast.success('Delivery confirmed');
      fetchParcelDetails();
    } catch {
      toast.error('Failed to confirm delivery');
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment processed successfully!');
    fetchParcelDetails();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {parcel.description || 'Parcel Details'}
          </h2>
          <p className="text-muted-foreground mt-2">Parcel ID: {parcel.id}</p>
          {parcel.trackingNumber && (
            <p className="text-muted-foreground">Tracking: {parcel.trackingNumber}</p>
          )}
        </div>
        <Badge className={statusColors[parcel.status]}>
          {statusLabels[parcel.status]}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {parcel.status === 'pending' && (
          <>
            <Link href={`/parcels/${parcelId}/edit`}>
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
          </>
        )}

        {parcel.status === 'matched' && parcel.senderId === user?.id && (
          <Button onClick={() => setShowPaymentModal(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        )}

        {parcel.status === 'in_transit' && (
          <>
            <Link href={`/parcels/${parcelId}/track`}>
              <Button variant="outline">
                <Navigation className="mr-2 h-4 w-4" />
                Track Parcel
              </Button>
            </Link>
            <Button onClick={handleConfirmDelivery}>Confirm Delivery</Button>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          parcelId={parcelId}
          amount={parcel.offeredPrice}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Parcel Details */}
      <Card>
        <CardHeader>
          <CardTitle>Parcel Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Pickup Location</p>
                  <p className="text-sm text-muted-foreground">
                    {(parcel as any).pickupAddress || parcel.pickupLocation?.address || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Delivery Location</p>
                  <p className="text-sm text-muted-foreground">
                    {(parcel as any).deliveryAddress || parcel.deliveryLocation?.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Weight className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Weight</p>
                  <p className="text-sm text-muted-foreground">{parcel.weight} kg</p>
                </div>
              </div>

              {parcel.dimensions && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Dimensions</p>
                    <p className="text-sm text-muted-foreground">
                      {parcel.dimensions.length} × {parcel.dimensions.width} × {parcel.dimensions.height} cm
                    </p>
                  </div>
                </div>
              )}

              {((parcel as any).size || parcel.category) && (
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{(parcel as any).size ? 'Size' : 'Category'}</p>
                    <p className="text-sm text-muted-foreground">
                      {(parcel as any).size || parcel.category}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Offered Price</p>
                  <p className="text-sm text-muted-foreground font-semibold text-green-600">
                    ₹{parcel.offeredPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Declared Value</p>
                  <p className="text-sm text-muted-foreground">₹{parcel.declaredValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="font-medium mb-2">Description</p>
            <p className="text-sm text-muted-foreground">{parcel.description}</p>
          </div>

          {parcel.images && parcel.images.length > 0 && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Images</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {parcel.images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg border overflow-hidden">
                    <img
                      src={image}
                      alt={`Parcel image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matched Trip */}
      {parcel.matchedTrip && (
        <Card>
          <CardHeader>
            <CardTitle>Matched Trip</CardTitle>
            <CardDescription>This parcel has been matched with a trip</CardDescription>
          </CardHeader>
          <CardContent>
            <TripCard trip={parcel.matchedTrip} />
          </CardContent>
        </Card>
      )}

      {/* Traveler Contact Information - Show when matched */}
      {(parcel.status === 'matched' || parcel.status === 'in_transit') && parcel.trip && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-green-600" />
              Traveler Contact Information
            </CardTitle>
            <CardDescription>
              Coordinate pickup and delivery with your traveler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {parcel.trip.user?.firstName} {parcel.trip.user?.lastName}
                  </p>
                </div>
              </div>

              {parcel.trip.user?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Phone</p>
                    <a
                      href={`tel:${parcel.trip.user.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {parcel.trip.user.phone}
                    </a>
                  </div>
                </div>
              )}

              {parcel.trip.user?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Email</p>
                    <a
                      href={`mailto:${parcel.trip.user.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {parcel.trip.user.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex gap-2">
              <a href={`tel:${parcel.trip.user?.phone}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </Button>
              </a>
              <Link href="/messages" className="flex-1">
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Trips - Show available travelers on similar routes */}
      {parcel.status === 'pending' && (
        <MatchingTrips
          parcelId={parcel.id}
          pickupAddress={(parcel as any).pickupAddress || parcel.pickupLocation?.address || ''}
          deliveryAddress={(parcel as any).deliveryAddress || parcel.deliveryLocation?.address || ''}
        />
      )}
    </div>
  );
}
