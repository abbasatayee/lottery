import { useState, useEffect, useRef, useCallback } from "react";
import {
  checkPermissionStatus,
  requestGeolocationPermission,
  getPermissionInstructions,
} from "../utils/permissionUtils";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isGPS?: boolean;
  accuracyLevel?: "high" | "medium" | "low";
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface LocationHookReturn {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
  isWatching: boolean;
  getLocationTips: () => Promise<string[]>;
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
    workerRef.current = new Worker("/location-worker.js");

    workerRef.current.onmessage = (event) => {
      const { type, status } = event.data;

      if (type === "LOCATION_STATUS") {
        if (status === "denied" && hasPermission) {
          // Permission was revoked mid-session
          setHasPermission(false);
          setLocation(null);
          setIsWatching(false);
          if (
            watchIdRef.current &&
            navigator.geolocation &&
            navigator.geolocation.clearWatch
          ) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setError("دسترسی به مجوزها لغو شد. لطفاً صفحه را تازه کنید.");
        }
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "STOP_LOCATION_CHECK" });
        workerRef.current.terminate();
      }
      if (
        watchIdRef.current &&
        navigator.geolocation &&
        navigator.geolocation.clearWatch
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasPermission]);

  const requestLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Check permission status first
      const permissionStatus = await checkPermissionStatus();

      if (!permissionStatus.isSupported) {
        throw new Error("مرورگر شما از این قابلیت پشتیبانی نمی‌کند");
      }

      if (permissionStatus.isDenied) {
        throw new Error(
          "دسترسی به مجوزها رد شده است. لطفاً در تنظیمات مرورگر اجازه دهید."
        );
      }

      // Request high-accuracy GPS location with retry mechanism
      let position: GeolocationPosition | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const currentPosition = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              if (
                !navigator.geolocation ||
                !navigator.geolocation.getCurrentPosition
              ) {
                reject(new Error("مرورگر شما از GPS پشتیبانی نمی‌کند"));
                return;
              }

              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, // Force GPS usage
                timeout: 60000, // 60 seconds timeout for GPS
                maximumAge: 0, // Always get fresh GPS data
              });
            }
          );

          // Check if we got GPS data (not network-based)
          const accuracy = currentPosition.coords.accuracy;
          const altitude = currentPosition.coords.altitude;
          const heading = currentPosition.coords.heading;
          const speed = currentPosition.coords.speed;

          const hasHighAccuracy = accuracy <= 20;
          const hasAltitude = altitude !== null && altitude !== undefined;
          const hasHeading = heading !== null && heading !== undefined;
          const hasSpeed = speed !== null && speed !== undefined;

          const isLikelyGPS =
            hasHighAccuracy || (hasAltitude && hasHeading && hasSpeed);

          // Assign position
          position = currentPosition;

          // If we got GPS data, break out of retry loop
          if (isLikelyGPS) {
            break;
          }

          // If this is the last attempt, use the position anyway
          if (attempts === maxAttempts - 1) {
            break;
          }

          // Otherwise, retry for better GPS signal
          attempts++;
          console.log(
            `Attempt ${attempts}: Got network-based location, retrying for GPS...`
          );
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }
          console.log(`Attempt ${attempts}: GPS error, retrying...`);
        }
      }

      // Enhanced GPS validation with multiple checks
      if (!position) {
        throw new Error("خطا در دریافت موقعیت GPS");
      }

      const accuracy = position.coords.accuracy;
      const altitude = position.coords.altitude;
      const heading = position.coords.heading;
      const speed = position.coords.speed;

      // Multiple GPS indicators
      const hasHighAccuracy = accuracy <= 20; // Very accurate
      const hasAltitude = altitude !== null && altitude !== undefined;
      const hasHeading = heading !== null && heading !== undefined;
      const hasSpeed = speed !== null && speed !== undefined;

      // Network-based locations typically have:
      // - High accuracy values (> 100m)
      // - No altitude data
      // - No heading data
      // - No speed data
      const isLikelyGPS =
        hasHighAccuracy || (hasAltitude && hasHeading && hasSpeed);

      const accuracyLevel: "high" | "medium" | "low" =
        accuracy <= 10 ? "high" : accuracy <= 50 ? "medium" : "low";

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: accuracy,
        timestamp: position.timestamp,
        isGPS: isLikelyGPS,
        accuracyLevel,
        altitude,
        heading,
        speed,
      };

      // Set location data first
      setLocation(locationData);
      setHasPermission(true);

      // Check if it's likely network-based location
      if (!isLikelyGPS) {
        setError(
          "موقعیت شبکه تشخیص داده شد. لطفاً مطمئن شوید که GPS دستگاه فعال است، VPN را غیرفعال کنید و در فضای باز باشید."
        );
        // Don't return here - let the user see their location and decide
      }

      // Start continuous location watching
      startLocationWatching();

      // Start monitoring location permission
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "START_LOCATION_CHECK" });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "خطا در دریافت مجوزها";
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const startLocationWatching = () => {
    if (!navigator.geolocation || !navigator.geolocation.watchPosition) {
      console.warn("Geolocation watchPosition not supported");
      return;
    }

    setIsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        const altitude = position.coords.altitude;
        const heading = position.coords.heading;
        const speed = position.coords.speed;

        // Same enhanced GPS detection logic
        const hasHighAccuracy = accuracy <= 20;
        const hasAltitude = altitude !== null && altitude !== undefined;
        const hasHeading = heading !== null && heading !== undefined;
        const hasSpeed = speed !== null && speed !== undefined;

        const isLikelyGPS =
          hasHighAccuracy || (hasAltitude && hasHeading && hasSpeed);
        const accuracyLevel: "high" | "medium" | "low" =
          accuracy <= 10 ? "high" : accuracy <= 50 ? "medium" : "low";

        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
          timestamp: position.timestamp,
          isGPS: isLikelyGPS,
          accuracyLevel,
          altitude,
          heading,
          speed,
        };
        setLocation(locationData);
      },
      (error) => {
        console.error("Location watch error:", error);
        setIsWatching(false);
        if (error.code === error.PERMISSION_DENIED) {
          setHasPermission(false);
          setLocation(null);
          setError("دسترسی به مجوزها رد شد");
        } else {
          setError("خطا در نظارت بر موقعیت");
        }
      },
      {
        enableHighAccuracy: true, // Force GPS usage
        timeout: 60000, // 60 seconds timeout for GPS
        maximumAge: 0, // Always get fresh GPS data
      }
    );
  };

  const getLocationTips = useCallback(async (): Promise<string[]> => {
    try {
      const permissionStatus = await checkPermissionStatus();
      return getPermissionInstructions(permissionStatus);
    } catch (error) {
      return [
        "مطمئن شوید که GPS دستگاه فعال است",
        "برای سیگنال بهتر، به فضای باز بروید",
        "وقتی درخواست شد، اجازه دهید",
        "VPN را غیرفعال کنید",
        "مرورگر خود را بررسی کنید",
      ];
    }
  }, []);

  return {
    location,
    error,
    loading,
    requestLocation,
    hasPermission,
    isWatching,
    getLocationTips,
  };
};
