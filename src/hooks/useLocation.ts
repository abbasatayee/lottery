import { useState, useEffect, useRef } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationHookReturn {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
  isWatching: boolean;
}

export const useLocation = (): LocationHookReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker('/location-worker.js');
    
    workerRef.current.onmessage = (event) => {
      const { type, status } = event.data;
      
      if (type === 'LOCATION_STATUS') {
        if (status === 'denied' && hasPermission) {
          // Permission was revoked mid-session
          setHasPermission(false);
          setLocation(null);
          setIsWatching(false);
          if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setError('Location access was revoked. Please refresh and grant permission.');
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP_LOCATION_CHECK' });
        workerRef.current.terminate();
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasPermission]);

  const requestLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // First get current position
      const position = await getCurrentPosition();
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(locationData);
      setHasPermission(true);
      
      // Start continuous location watching
      startLocationWatching();
      
      // Start monitoring location permission
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'START_LOCATION_CHECK' });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const startLocationWatching = () => {
    if (!navigator.geolocation) return;
    
    setIsWatching(true);
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(locationData);
      },
      (error) => {
        console.error('Location watch error:', error);
        setIsWatching(false);
        if (error.code === error.PERMISSION_DENIED) {
          setHasPermission(false);
          setLocation(null);
          setError('Location access was denied or revoked');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Location access denied by user'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable'));
              break;
            case error.TIMEOUT:
              reject(new Error('Location request timed out'));
              break;
            default:
              reject(new Error('An unknown error occurred'));
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    });
  };

  return {
    location,
    error,
    loading,
    requestLocation,
    hasPermission,
    isWatching
  };
};