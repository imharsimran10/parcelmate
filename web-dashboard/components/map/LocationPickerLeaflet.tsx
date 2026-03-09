'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Location } from '@/types';
import { Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '@/lib/leaflet-config';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  label?: string;
}

// Component to handle map clicks
function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}


// Draggable marker component
function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<any>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export default function LocationPickerLeaflet({
  onLocationSelect,
  initialLocation,
  label = 'Select Location',
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || ''); // Always string
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLocation
      ? [initialLocation.latitude, initialLocation.longitude]
      : [12.9716, 77.5946] // Default to Bangalore, India
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [key, setKey] = useState(0); // Force re-render when location changes

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocationChange = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);
    setKey((prev) => prev + 1); // Force map to re-render with new center

    // Use Nominatim (OpenStreetMap) for reverse geocoding - completely free, no API key
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ParcelMate-Demo-App',
          },
        }
      );
      const data = await response.json();

      if (data && data.display_name) {
        const location: Location = {
          latitude: lat,
          longitude: lng,
          address: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village || '',
          country: data.address?.country || '',
        };

        setSelectedLocation(location);
        setSearchQuery(location.address);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // Fallback location without address details
      const location: Location = {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        country: '',
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Use Nominatim for geocoding - completely free, no API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'ParcelMate-Demo-App',
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        const location: Location = {
          latitude: lat,
          longitude: lng,
          address: result.display_name,
          city: result.address?.city || result.address?.town || result.address?.village || '',
          country: result.address?.country || '',
        };

        setSelectedLocation(location);
        setMarkerPosition([lat, lng]);
        setMapCenter([lat, lng]);
        onLocationSelect(location);
      }
    } catch (error) {
      console.error('Geocoding search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-4">
        <div>
          <Label>{label}</Label>
          <div className="flex gap-2 mt-2">
            <Input type="text" placeholder="Loading map..." disabled />
            <Button type="button" size="icon" disabled>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button type="button" onClick={handleSearch} size="icon" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
          Map ready - Click on the map or search for a location
        </p>
      </div>

      <div className="relative w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={initialLocation ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
          key={key}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markerPosition && (
            <DraggableMarker
              position={markerPosition}
              onDragEnd={handleLocationChange}
            />
          )}
          <MapClickHandler onLocationChange={handleLocationChange} />
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="text-sm space-y-1">
          <p className="font-medium">Selected Location:</p>
          <p className="text-muted-foreground">{selectedLocation.address}</p>
          {selectedLocation.city && (
            <p className="text-muted-foreground">
              {selectedLocation.city}, {selectedLocation.country}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
