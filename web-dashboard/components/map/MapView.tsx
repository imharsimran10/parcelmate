'use client';

import { useEffect, useRef } from 'react';
import { useMap, addMarker, fitBounds, drawRoute } from '@/hooks/useMap';
import mapboxgl from 'mapbox-gl';

interface MapViewProps {
  locations: {
    coordinates: [number, number];
    label?: string;
    color?: string;
  }[];
  showRoute?: boolean;
  height?: string;
  className?: string;
}

export default function MapView({
  locations,
  showRoute = false,
  height = 'h-96',
  className = '',
}: MapViewProps) {
  const mapContainerId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`).current;
  const { map, isLoaded } = useMap(mapContainerId);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!map || !isLoaded || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const marker = addMarker(map, location.coordinates, {
        color: location.color || '#3b82f6',
      });

      if (location.label) {
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText(location.label)
        );
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (locations.length > 1) {
      fitBounds(
        map,
        locations.map((loc) => loc.coordinates)
      );
    } else if (locations.length === 1) {
      map.flyTo({ center: locations[0].coordinates, zoom: 12 });
    }

    // Draw route if requested
    if (showRoute && locations.length >= 2) {
      drawRoute(
        map,
        locations.map((loc) => loc.coordinates)
      );
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [map, isLoaded, locations, showRoute]);

  return (
    <div
      id={mapContainerId}
      className={`w-full ${height} rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    />
  );
}
