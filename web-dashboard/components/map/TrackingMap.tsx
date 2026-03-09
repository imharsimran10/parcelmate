'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap, addMarker, fitBounds, drawRoute } from '@/hooks/useMap';
import { useTracking, useGeolocation } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, MapPin, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import mapboxgl from 'mapbox-gl';

interface TrackingMapProps {
  parcelId: string;
  pickupLocation: { latitude: number; longitude: number; address: string };
  deliveryLocation: { latitude: number; longitude: number; address: string };
  isTraveler?: boolean;
}

export default function TrackingMap({
  parcelId,
  pickupLocation,
  deliveryLocation,
  isTraveler = false,
}: TrackingMapProps) {
  const mapContainerId = useRef(`tracking-map-${Math.random().toString(36).substr(2, 9)}`).current;
  const { map, isLoaded } = useMap(mapContainerId);
  const [isSharing, setIsSharing] = useState(false);

  // For travelers: get GPS location and share it
  const { location: gpsLocation, error: gpsError } = useGeolocation();

  // For everyone: track parcel location updates
  const { currentLocation, isTracking, updateLocation } = useTracking({
    parcelId,
    onLocationUpdate: (update) => {
      console.log('Location update received:', update);
    },
  });

  const pickupMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const deliveryMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const travelerMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Initialize map with pickup and delivery markers
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Add pickup marker (green)
    if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
    pickupMarkerRef.current = addMarker(
      map,
      [pickupLocation.longitude, pickupLocation.latitude],
      { color: '#22c55e' }
    );
    pickupMarkerRef.current.setPopup(
      new mapboxgl.Popup({ offset: 25 }).setText('Pickup: ' + pickupLocation.address)
    );

    // Add delivery marker (red)
    if (deliveryMarkerRef.current) deliveryMarkerRef.current.remove();
    deliveryMarkerRef.current = addMarker(
      map,
      [deliveryLocation.longitude, deliveryLocation.latitude],
      { color: '#ef4444' }
    );
    deliveryMarkerRef.current.setPopup(
      new mapboxgl.Popup({ offset: 25 }).setText('Delivery: ' + deliveryLocation.address)
    );

    // Draw route
    drawRoute(map, [
      [pickupLocation.longitude, pickupLocation.latitude],
      [deliveryLocation.longitude, deliveryLocation.latitude],
    ]);

    // Fit bounds
    fitBounds(map, [
      [pickupLocation.longitude, pickupLocation.latitude],
      [deliveryLocation.longitude, deliveryLocation.latitude],
    ]);

    return () => {
      pickupMarkerRef.current?.remove();
      deliveryMarkerRef.current?.remove();
      travelerMarkerRef.current?.remove();
    };
  }, [map, isLoaded, pickupLocation, deliveryLocation]);

  // Update traveler marker when location changes
  useEffect(() => {
    if (!map || !isLoaded || !currentLocation) return;

    const { latitude, longitude } = currentLocation.location;

    // Remove old marker
    if (travelerMarkerRef.current) {
      travelerMarkerRef.current.remove();
    }

    // Add new traveler marker (blue, pulsing)
    travelerMarkerRef.current = addMarker(map, [longitude, latitude], {
      color: '#3b82f6',
    });
    travelerMarkerRef.current.setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div>
          <strong>Traveler Location</strong>
          <p>Updated: ${format(new Date(currentLocation.timestamp), 'p')}</p>
        </div>
      `)
    );

    // Pan to traveler location
    map.flyTo({ center: [longitude, latitude], zoom: 14 });
  }, [map, isLoaded, currentLocation]);

  // Share location (travelers only)
  useEffect(() => {
    if (!isTraveler || !isSharing || !gpsLocation) return;

    const interval = setInterval(() => {
      updateLocation(gpsLocation.latitude, gpsLocation.longitude);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isTraveler, isSharing, gpsLocation, updateLocation]);

  const handleStartSharing = () => {
    if (gpsLocation) {
      setIsSharing(true);
      updateLocation(gpsLocation.latitude, gpsLocation.longitude);
    }
  };

  const handleStopSharing = () => {
    setIsSharing(false);
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Real-time Tracking
              </CardTitle>
              <CardDescription>
                {isTracking ? 'Connected to tracking service' : 'Connecting...'}
              </CardDescription>
            </div>
            <Badge variant={isTracking ? 'default' : 'secondary'}>
              {isTracking ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="text-sm font-medium">Pickup Location</p>
                <p className="text-xs text-muted-foreground">{pickupLocation.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-1" />
              <div>
                <p className="text-sm font-medium">Delivery Location</p>
                <p className="text-xs text-muted-foreground">{deliveryLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Current Location */}
          {currentLocation && (
            <div className="flex items-start gap-3 pt-4 border-t">
              <User className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm font-medium">Traveler Location</p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {format(new Date(currentLocation.timestamp), 'PPp')}
                </p>
              </div>
            </div>
          )}

          {/* Traveler Controls */}
          {isTraveler && (
            <div className="pt-4 border-t">
              {gpsError ? (
                <div className="text-sm text-destructive">
                  GPS Error: {gpsError}. Please enable location services.
                </div>
              ) : gpsLocation ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {isSharing ? 'Sharing location every 10 seconds' : 'GPS ready'}
                    </span>
                  </div>
                  {isSharing ? (
                    <Button variant="destructive" size="sm" onClick={handleStopSharing}>
                      Stop Sharing
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleStartSharing}>
                      Start Sharing Location
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Getting GPS location...</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <div
        id={mapContainerId}
        className="w-full h-[500px] rounded-lg border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
}
