import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface UseMapOptions {
  center?: [number, number];
  zoom?: number;
}

export const useMap = (containerId: string, options?: UseMapOptions) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken || mapboxToken === 'your_mapbox_token_here') {
      console.warn('Mapbox token not configured. Map functionality will be limited.');
      return;
    }

    // Small delay to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      // Check if container element exists in DOM
      const containerElement = document.getElementById(containerId);
      if (!containerElement) {
        console.warn(`Map container with id "${containerId}" not found in DOM`);
        setIsLoaded(true); // Set loaded anyway to prevent infinite spinner
        return;
      }

      console.log('Initializing map with container:', containerId);
      mapboxgl.accessToken = mapboxToken;

      try {
        const map = new mapboxgl.Map({
          container: containerId,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: options?.center || [77.5946, 12.9716], // Default to Bangalore, India
          zoom: options?.zoom || 6,
        });

        console.log('Map instance created');
        mapRef.current = map;

        // Wait for map to fully load before allowing interactions
        map.once('load', () => {
          console.log('Map style fully loaded');

          // Additional check: wait for map to be fully rendered
          map.once('idle', () => {
            console.log('Map is idle and fully ready');
            const container = map.getContainer();
            console.log('Map container status:', {
              exists: !!container,
              hasParent: !!container?.parentNode,
              isConnected: container instanceof Element ? (container as Element).isConnected : false
            });
            setIsLoaded(true);
          });

          // Add navigation controls
          try {
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
          } catch (e) {
            console.warn('Failed to add navigation controls:', e);
          }
        });

        // Timeout fallback: if map doesn't load in 5 seconds, set loaded anyway
        loadTimeoutRef.current = setTimeout(() => {
          if (mapRef.current && !isLoaded) {
            console.warn('Map load timeout - enabling interactions anyway');
            setIsLoaded(true);
          }
        }, 5000);

        // Handle errors
        map.on('error', (e) => {
          console.error('Map error:', e.error);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
          // Set loaded on error so UI doesn't hang
          setIsLoaded(true);
        });
      } catch (error) {
        console.error('Failed to initialize map:', error);
        // Set loaded to true even on error so UI doesn't hang
        setIsLoaded(true);
      }
    }, 100); // Increased to 100ms delay to ensure DOM is ready

    return () => {
      clearTimeout(initTimeout);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      console.log('Cleaning up map');
      if (mapRef.current && !mapRef.current._removed) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      setIsLoaded(false);
    };
  }, [containerId, options?.center, options?.zoom]);

  return { map: mapRef.current, isLoaded };
};

export const addMarker = (
  map: mapboxgl.Map | null,
  coordinates: [number, number],
  options?: {
    color?: string;
    draggable?: boolean;
    onDragEnd?: (lngLat: mapboxgl.LngLat) => void;
  }
): mapboxgl.Marker => {
  // Check if map exists
  if (!map) {
    throw new Error('Map is not initialized. Cannot add marker.');
  }

  // Check if map has been removed
  if ('_removed' in map && map._removed) {
    throw new Error('Map has been removed from DOM.');
  }

  // Check if map has a valid container
  try {
    const container = map.getContainer();
    if (!container) {
      throw new Error('Map container does not exist.');
    }
    if (!container.parentNode) {
      throw new Error('Map container is not attached to DOM.');
    }
    // Check if container is actually in the document
    if (!(container as Element).isConnected) {
      throw new Error('Map container is not connected to document.');
    }
  } catch (e) {
    throw new Error('Map container is not ready: ' + (e as Error).message);
  }

  // Validate coordinates
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error('Invalid coordinates format. Expected [lng, lat].');
  }

  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new Error('Coordinates must be numbers.');
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new Error('Coordinates out of valid range.');
  }

  // Create marker first
  const marker = new mapboxgl.Marker({
    color: options?.color || '#3b82f6',
    draggable: options?.draggable || false,
  }).setLngLat(coordinates);

  // Try to add to map
  try {
    marker.addTo(map);
  } catch (e) {
    throw new Error('Failed to add marker to map: ' + (e as Error).message);
  }

  if (options?.draggable && options?.onDragEnd) {
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      options.onDragEnd?.(lngLat);
    });
  }

  return marker;
};

export const fitBounds = (
  map: mapboxgl.Map,
  coordinates: [number, number][],
  padding = 50
) => {
  if (coordinates.length === 0) return;

  const bounds = coordinates.reduce(
    (bounds, coord) => bounds.extend(coord as mapboxgl.LngLatLike),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
  );

  map.fitBounds(bounds, { padding });
};

export const drawRoute = (
  map: mapboxgl.Map,
  coordinates: [number, number][],
  sourceId = 'route',
  layerId = 'route-layer'
) => {
  if (map.getSource(sourceId)) {
    (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    });
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
      },
    });
  }
};
