import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { LocationUpdate } from '@/types';

interface TrackingOptions {
  parcelId: string;
  onLocationUpdate?: (location: LocationUpdate) => void;
}

export const useTracking = ({ parcelId, onLocationUpdate }: TrackingOptions) => {
  const { socket, isConnected } = useSocket();
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Join tracking room
  useEffect(() => {
    if (!socket || !isConnected || !parcelId) return;

    socket.emit('joinParcelTracking', { parcelId });
    setIsTracking(true);

    return () => {
      socket.emit('leaveParcelTracking', { parcelId });
      setIsTracking(false);
    };
  }, [socket, isConnected, parcelId]);

  // Listen for location updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLocationUpdate = (data: LocationUpdate) => {
      if (data.parcelId === parcelId) {
        setCurrentLocation(data);
        onLocationUpdate?.(data);
      }
    };

    socket.on('locationUpdate', handleLocationUpdate);

    return () => {
      socket.off('locationUpdate', handleLocationUpdate);
    };
  }, [socket, isConnected, parcelId, onLocationUpdate]);

  // Send location update (for travelers)
  const updateLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (!socket || !isConnected) return;

      const locationUpdate: LocationUpdate = {
        parcelId,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      };

      socket.emit('updateLocation', locationUpdate);
    },
    [socket, isConnected, parcelId]
  );

  return {
    currentLocation,
    isTracking,
    updateLocation,
  };
};

// Hook to get real-time GPS position (for travelers)
export const useGeolocation = (options?: PositionOptions) => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, error, isLoading };
};
