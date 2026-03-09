'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactDetailsModal from '@/components/modals/ContactDetailsModal';
import { MapPin, Package, IndianRupee, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Parcel } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MatchingParcelsProps {
  tripId: string;
  originAddress: string;
  destAddress: string;
}

export default function MatchingParcels({ tripId, originAddress, destAddress }: MatchingParcelsProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchingParcels();
  }, [tripId]);

  const fetchMatchingParcels = async () => {
    try {
      // Get all pending parcels
      const response = await api.get('/parcels', {
        params: {
          status: 'DRAFT,REQUESTING',
          limit: 50,
        },
      });

      const allParcels = response.data?.data || response.data || [];

      // Filter parcels that match the route (basic string matching)
      const matchingParcels = allParcels.filter((parcel: Parcel) => {
        const pickupAddr = (parcel as any).pickupAddress || parcel.pickupLocation?.address || '';
        const deliveryAddr = (parcel as any).deliveryAddress || parcel.deliveryLocation?.address || '';

        // Simple matching: check if addresses contain similar city names
        const originCities = originAddress.toLowerCase().split(',').map(s => s.trim());
        const destCities = destAddress.toLowerCase().split(',').map(s => s.trim());
        const pickupCities = pickupAddr.toLowerCase().split(',').map(s => s.trim());
        const deliveryCities = deliveryAddr.toLowerCase().split(',').map(s => s.trim());

        // Check if any origin city matches any pickup city
        const originMatches = originCities.some(oc => pickupCities.some(pc => pc.includes(oc) || oc.includes(pc)));
        // Check if any dest city matches any delivery city
        const destMatches = destCities.some(dc => deliveryCities.some(dlc => dlc.includes(dc) || dc.includes(dlc)));

        return originMatches || destMatches;
      });

      setParcels(matchingParcels);
    } catch (error) {
      console.error('Failed to fetch matching parcels:', error);
      toast.error('Failed to load matching parcels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatch = async (parcel: any) => {
    setIsAccepting(parcel.id);
    try {
      // Use the accept endpoint for travelers (creates a match request)
      const response = await api.post(`/parcels/${parcel.id}/accept`, {
        tripId: tripId,
      });

      const matchRequest = response.data?.data || response.data;

      toast.success('Match request sent! Waiting for sender approval.');

      // Refresh the list
      fetchMatchingParcels();
    } catch (error: any) {
      console.error('Failed to accept delivery:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setIsAccepting(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching Parcels</CardTitle>
          <CardDescription>Finding parcels that need delivery on your route...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parcels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matching Parcels</CardTitle>
          <CardDescription>Parcels that need delivery on your route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No matching parcels found for this route.</p>
            <p className="text-sm mt-2">Check back later for new delivery requests.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matching Parcels ({parcels.length})</CardTitle>
        <CardDescription>Parcels that need delivery on your route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {parcels.map((parcel) => (
            <Card key={parcel.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {(parcel as any).title || parcel.description?.substring(0, 30) || 'Parcel'}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {(parcel as any).size || parcel.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{parcel.offeredPrice}
                      </p>
                      <p className="text-xs text-muted-foreground">{parcel.weight} kg</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Pickup</p>
                        <p className="text-muted-foreground text-xs">
                          {(parcel as any).pickupAddress || parcel.pickupLocation?.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Delivery</p>
                        <p className="text-muted-foreground text-xs">
                          {(parcel as any).deliveryAddress || parcel.deliveryLocation?.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/parcels/${parcel.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMatch(parcel)}
                      disabled={isAccepting === parcel.id}
                    >
                      {isAccepting === parcel.id ? 'Accepting...' : 'Accept Delivery'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Contact Details Modal */}
      {selectedParcel && (
        <ContactDetailsModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          type="parcel"
          contactPerson={{
            name: `${selectedParcel.sender?.firstName || ''} ${selectedParcel.sender?.lastName || ''}`.trim() || 'Sender',
            phone: (selectedParcel as any).recipientPhone || 'Not provided',
            email: (selectedParcel as any).recipientEmail,
          }}
          details={{
            from: (selectedParcel as any).pickupAddress || selectedParcel.pickupLocation?.address || 'Pickup location',
            to: (selectedParcel as any).deliveryAddress || selectedParcel.deliveryLocation?.address || 'Delivery location',
            date: (selectedParcel as any).pickupTimeStart ? format(new Date((selectedParcel as any).pickupTimeStart), 'PPP') : undefined,
            price: selectedParcel.offeredPrice,
            weight: selectedParcel.weight,
          }}
        />
      )}
    </Card>
  );
}
