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

      // Request high-accuracy GPS location specifically
      const position = await new Promise<GeolocationPosition>(
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

      // Validate GPS accuracy
      const accuracy = position.coords.accuracy;
      const accuracyLevel: "high" | "medium" | "low" =
        accuracy <= 10 ? "high" : accuracy <= 50 ? "medium" : "low";

      // Stricter GPS validation - must be very accurate
      const isGPS = accuracy <= 50; // GPS should be more accurate than 50m

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: accuracy,
        timestamp: position.timestamp,
        isGPS,
        accuracyLevel,
      };

      // Set location data first
      setLocation(locationData);
      setHasPermission(true);

      // Check if it's likely VPN/proxy location (low accuracy)
      if (!isGPS) {
        setError(
          "GPS دقیق یافت نشد. لطفاً مطمئن شوید که GPS دستگاه فعال است و در فضای باز هستید."
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
        const isGPS = accuracy <= 50; // Same strict GPS validation
        const accuracyLevel: "high" | "medium" | "low" =
          accuracy <= 10 ? "high" : accuracy <= 50 ? "medium" : "low";

        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
          timestamp: position.timestamp,
          isGPS,
          accuracyLevel,
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
