import { useState, useEffect, useRef } from "react";

interface VPNCheckResult {
  isVPN: boolean;
  locationData: {
    country?: string;
    city?: string;
    region?: string;
    ip?: string;
  };
}

interface VPNHookReturn {
  vpnStatus: VPNCheckResult | null;
  checking: boolean;
  error: string | null;
  checkVPN: () => Promise<void>;
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

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      console.log("IP detected:", data.ip);
      return data.ip;
    } catch (error) {
      console.log("Primary IP detection failed, trying fallback...");
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        console.log("Fallback IP detected:", data.ip);
        return data.ip;
      } catch (fallbackError) {
        console.error("All IP detection methods failed");
        throw new Error("Unable to detect IP address");
      }
    }
  };

  const checkVPN = async (): Promise<void> => {
    setChecking(true);
    setError(null);

    try {
      const userIP = await getUserIP();
      console.log("Checking VPN for IP:", userIP);

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "CHECK_VPN",
          data: { ip: userIP },
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
