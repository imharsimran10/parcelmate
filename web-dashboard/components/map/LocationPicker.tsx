'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap, addMarker } from '@/hooks/useMap';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Location } from '@/types';
import { Search } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  label?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  label = 'Select Location',
}: LocationPickerProps) {
  const mapContainerId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`).current;
  const { map, isLoaded } = useMap(mapContainerId, {
    center: initialLocation
      ? [initialLocation.longitude, initialLocation.latitude]
      : [77.5946, 12.9716], // Default to Bangalore, India
    zoom: initialLocation ? 12 : 6,
  });

  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) {
      console.log('Map not ready yet:', { mapExists: !!map, isLoaded });
      return;
    }

    console.log('Setting up map interactions');

    // Add click handler to map
    const clickHandler = async (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // First update the location
      await handleLocationChange(lng, lat);

      // Then add marker - no delay needed since map is already loaded
      try {
        if (map && isLoaded) {
          console.log('Attempting to add marker on click...');
          markerRef.current = addMarker(map, [lng, lat], {
            draggable: true,
            onDragEnd: (lngLat) => {
              handleLocationChange(lngLat.lng, lngLat.lat);
            },
          });
          console.log('✓ Marker added on click at', lng, lat);
        }
      } catch (error) {
        console.error('✗ Failed to add marker on click:', error);
      }
    };

    map.on('click', clickHandler);

    // Add initial marker if location provided
    if (initialLocation && !markerRef.current) {
      console.log('Adding initial marker for location:', initialLocation);
      try {
        markerRef.current = addMarker(
          map,
          [initialLocation.longitude, initialLocation.latitude],
          {
            draggable: true,
            onDragEnd: (lngLat) => {
              handleLocationChange(lngLat.lng, lngLat.lat);
            },
          }
        );
        console.log('✓ Initial marker added');
      } catch (error) {
        console.error('✗ Failed to add initial marker:', error);
        // Not critical - user can still select location manually
      }
    }

    // Cleanup function
    return () => {
      if (map) {
        map.off('click', clickHandler);
      }
    };
  }, [map, isLoaded]);

  const handleLocationChange = async (lng: number, lat: number) => {
    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const location: Location = {
          latitude: lat,
          longitude: lng,
          address: feature.place_name,
          city: feature.context?.find((c: { id: string }) => c.id.includes('place'))?.text || '',
          country: feature.context?.find((c: { id: string }) => c.id.includes('country'))?.text || '',
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

    console.log('🔍 Search initiated for:', searchQuery);
    console.log('Map state - exists:', !!map, 'isLoaded:', isLoaded);

    // Check if map is ready
    if (!map || !isLoaded) {
      console.warn('⚠️ Map not ready yet. Please wait...');
      alert('Map is still loading. Please wait a moment and try again.');
      return;
    }

    console.log('✓ Map is ready, proceeding with search');

    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
        console.error('❌ Mapbox token not configured');
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();

      console.log('📍 Geocoding response:', data.features?.length || 0, 'results');

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        console.log('✓ Found location:', feature.place_name, 'at', lng, lat);

        // First, fly to the location
        console.log('🗺️ Flying to location...');
        map.flyTo({ center: [lng, lat], zoom: 12 });

        // Update location data immediately
        const location: Location = {
          latitude: lat,
          longitude: lng,
          address: feature.place_name,
          city: feature.context?.find((c: { id: string }) => c.id.includes('place'))?.text || '',
          country: feature.context?.find((c: { id: string }) => c.id.includes('country'))?.text || '',
        };

        setSelectedLocation(location);
        onLocationSelect(location);

        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        // Wait for map to finish flying animation before adding marker
        map.once('moveend', () => {
          try {
            if (!map || !isLoaded) {
              console.error('Map not ready for marker');
              return;
            }

            console.log('Attempting to add marker after moveend...');
            markerRef.current = addMarker(map, [lng, lat], {
              draggable: true,
              onDragEnd: (lngLat) => {
                handleLocationChange(lngLat.lng, lngLat.lat);
              },
            });
            console.log('✓ Marker added successfully at', lng, lat);
          } catch (markerError) {
            console.error('✗ Failed to add marker:', markerError);
            // Location is still saved, just marker couldn't be placed
          }
        });
      }
    } catch (error) {
      console.error('Geocoding search failed:', error);
    }
  };

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
          <Button type="button" onClick={handleSearch} size="icon" disabled={!isLoaded}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {isLoaded ? (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
            Map ready - Click on the map or search for a location
          </p>
        ) : (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></span>
            Loading map... Please wait
          </p>
        )}
      </div>

      <div className="relative">
        <div
          id={mapContainerId}
          className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading Mapbox...</p>
          </div>
        )}
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
