import { useCallback, useState } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isGPS?: boolean;
  accuracyLevel?: "high" | "medium" | "low";
}

interface AdditionalData {
  accuracy: number;
  timestamp: number;
  isGPS: boolean;
  accuracyLevel: "high" | "medium" | "low";
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  connectionType?: string;
  batteryLevel?: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

interface UseLocationAPIReturn {
  isSending: boolean;
  lastSent: Date | null;
  error: string | null;
  sendLocationData: () => Promise<void>;
}

export const useLocationAPI = (
  location: LocationData | null
): UseLocationAPIReturn => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAdditionalData = useCallback((): AdditionalData => {
    const additionalData: AdditionalData = {
      accuracy: location?.accuracy || 0,
      timestamp: location?.timestamp || Date.now(),
      isGPS: location?.isGPS || false,
      accuracyLevel: location?.accuracyLevel || "low",
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    };

    // Add connection information if available
    if ("connection" in navigator) {
      const connection = (
        navigator as Navigator & {
          connection?: { effectiveType?: string; type?: string };
        }
      ).connection;
      if (connection) {
        additionalData.connectionType =
          connection.effectiveType || connection.type;
      }
    }

    // Add battery information if available
    if ("getBattery" in navigator) {
      navigator
        .getBattery()
        .then((battery) => {
          additionalData.batteryLevel = battery.level;
        })
        .catch(() => {
          // Ignore battery errors
        });
    }

    // Add device memory if available
    if ("deviceMemory" in navigator) {
      additionalData.deviceMemory = (
        navigator as Navigator & { deviceMemory?: number }
      ).deviceMemory;
    }

    // Add hardware concurrency if available
    if ("hardwareConcurrency" in navigator) {
      additionalData.hardwareConcurrency = navigator.hardwareConcurrency;
    }

    return additionalData;
  }, [location]);

  const sendLocationData = useCallback(async () => {
    if (!location) return;

    setIsSending(true);
    setError(null);

    try {
      const additionalData = getAdditionalData();

      const response = await fetch("/api/backend/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLastSent(new Date());
      console.log("Location data sent successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error sending location data:", err);
    } finally {
      setIsSending(false);
    }
  }, [location, getAdditionalData]);

  return {
    isSending,
    lastSent,
    error,
    sendLocationData,
  };
};
