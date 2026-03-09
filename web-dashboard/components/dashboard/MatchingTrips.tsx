'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ContactDetailsModal from '@/components/modals/ContactDetailsModal';
import { MapPin, Calendar, IndianRupee, User, Package } from 'lucide-react';
import api from '@/lib/api';
import { Trip } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MatchingTripsProps {
  parcelId: string;
  pickupAddress: string;
  deliveryAddress: string;
}

export default function MatchingTrips({ parcelId, pickupAddress, deliveryAddress }: MatchingTripsProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isRequesting, setIsRequesting] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchingTrips();
  }, [parcelId]);

  const fetchMatchingTrips = async () => {
    try {
      // Get all available trips
      const response = await api.get('/trips', {
        params: {
          status: 'DRAFT,PUBLISHED',
          limit: 50,
        },
      });

      const allTrips = response.data?.data || response.data || [];

      // Filter trips that match the route
      const matchingTrips = allTrips.filter((trip: Trip) => {
        const originAddr = (trip as any).originAddress || trip.origin?.address || '';
        const destAddr = (trip as any).destAddress || trip.destination?.address || '';

        // Simple matching: check if addresses contain similar city names
        const originCities = originAddr.toLowerCase().split(',').map((s: string) => s.trim());
        const destCities = destAddr.toLowerCase().split(',').map((s: string) => s.trim());
        const pickupCities = pickupAddress.toLowerCase().split(',').map(s => s.trim());
        const deliveryCities = deliveryAddress.toLowerCase().split(',').map(s => s.trim());

        // Check if any origin city matches any pickup city
        const originMatches = originCities.some((oc: string) =>
          pickupCities.some(pc => pc.includes(oc) || oc.includes(pc))
        );
        // Check if any dest city matches any delivery city
        const destMatches = destCities.some((dc: string) =>
          deliveryCities.some(dlc => dlc.includes(dc) || dc.includes(dlc))
        );

        return originMatches || destMatches;
      });

      setTrips(matchingTrips);
    } catch (error) {
      console.error('Failed to fetch matching trips:', error);
      toast.error('Failed to load matching trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (trip: any) => {
    setIsRequesting(trip.id);
    try {
      // Use the request endpoint for senders (creates a match request)
      const response = await api.post(`/parcels/${parcelId}/request`, {
        tripId: trip.id,
      });

      const matchRequest = response.data?.data || response.data;

      toast.success('Match request sent! Waiting for traveler approval.');

      // Refresh the list
      fetchMatchingTrips();
    } catch (error: any) {
      console.error('Failed to request match:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to request match');
    } finally {
      setIsRequesting(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Travelers</CardTitle>
          <CardDescription>Finding travelers going on your route...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Travelers</CardTitle>
          <CardDescription>Travelers going on your route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No travelers found for this route.</p>
            <p className="text-sm mt-2">Check back later for new travelers.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Travelers ({trips.length})</CardTitle>
        <CardDescription>Travelers going on your route</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        {(trip as any).originAddress?.split(',')[0] || trip.origin?.city || 'Origin'}
                        <span className="text-muted-foreground">→</span>
                        <MapPin className="h-4 w-4 text-red-600" />
                        {(trip as any).destAddress?.split(',')[0] || trip.destination?.city || 'Destination'}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(
                          new Date((trip as any).departureTime || trip.departureDate),
                          'PPp'
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Capacity: {(trip as any).maxWeight || trip.availableCapacity} kg
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-green-600">
                        ₹{(trip as any).basePricePerKg || trip.pricePerKg}/kg
                      </span>
                    </div>
                  </div>

                  {trip.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {trip.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/trips/${trip.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRequest(trip)}
                      disabled={isRequesting === trip.id}
                    >
                      {isRequesting === trip.id ? 'Requesting...' : 'Request Match'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Contact Details Modal */}
      {selectedTrip && (
        <ContactDetailsModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          type="trip"
          contactPerson={{
            name: `${selectedTrip.user?.firstName || selectedTrip.traveler?.firstName || ''} ${selectedTrip.user?.lastName || selectedTrip.traveler?.lastName || ''}`.trim() || 'Traveler',
            phone: selectedTrip.user?.phone || selectedTrip.traveler?.phone || 'Not provided',
            email: selectedTrip.user?.email || selectedTrip.traveler?.email,
          }}
          details={{
            from: (selectedTrip as any).originAddress || selectedTrip.origin?.address || 'Origin',
            to: (selectedTrip as any).destAddress || selectedTrip.destination?.address || 'Destination',
            date: format(new Date((selectedTrip as any).departureTime || selectedTrip.departureDate), 'PPP'),
            price: ((selectedTrip as any).basePricePerKg || selectedTrip.pricePerKg) * 1, // Multiply by weight when available
          }}
        />
      )}
    </Card>
  );
}
