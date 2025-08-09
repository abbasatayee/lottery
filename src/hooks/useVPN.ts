import { useState, useEffect, useRef } from "react";

interface VPNCheckResult {
  isVPN: boolean;
  locationData: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    isGPS?: boolean;
  };
}

interface VPNHookReturn {
  vpnStatus: VPNCheckResult | null;
  checking: boolean;
  error: string | null;
  checkVPN: (locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    isGPS?: boolean;
  }) => Promise<void>;
}

export const useVPN = (): VPNHookReturn => {
  const [vpnStatus, setVpnStatus] = useState<VPNCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker("/location-worker.js");

    workerRef.current.onmessage = (event) => {
      const { type, vpnDetected, locationData, error } = event.data;

      console.log("Worker message received:", type, event.data);

      if (type === "VPN_CHECK_RESULT") {
        console.log("VPN check result:", { vpnDetected, locationData });
        setVpnStatus({
          isVPN: vpnDetected,
          locationData: locationData || {},
        });
        setChecking(false);
      } else if (type === "VPN_CHECK_ERROR") {
        console.error("VPN check error from worker:", error);
        setError(error);
        setChecking(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const checkVPN = async (locationData?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    isGPS?: boolean;
  }): Promise<void> => {
    setChecking(true);
    setError(null);

    try {
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "CHECK_VPN",
          data: { locationData },
        });

        // Add timeout to prevent hanging
        setTimeout(() => {
          if (checking) {
            console.log("VPN check timeout, setting error");
            setError("VPN check timed out");
            setChecking(false);
          }
        }, 15000); // 15 second timeout
      } else {
        throw new Error("Worker not initialized");
      }
    } catch (err) {
      console.error("VPN check failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to check VPN status"
      );
      setChecking(false);
    }
  };

  return {
    vpnStatus,
    checking,
    error,
    checkVPN,
  };
};
