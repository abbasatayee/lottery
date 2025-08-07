import { useState, useEffect, useRef } from 'react';

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
    workerRef.current = new Worker('/location-worker.js');
    
    workerRef.current.onmessage = (event) => {
      const { type, vpnDetected, locationData, error } = event.data;
      
      if (type === 'VPN_CHECK_RESULT') {
        setVpnStatus({
          isVPN: vpnDetected,
          locationData: locationData || {}
        });
        setChecking(false);
      } else if (type === 'VPN_CHECK_ERROR') {
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
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      // Fallback IP detection
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.ip;
    }
  };

  const checkVPN = async (): Promise<void> => {
    setChecking(true);
    setError(null);

    try {
      const userIP = await getUserIP();
      
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'CHECK_VPN',
          data: { ip: userIP }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check VPN status');
      setChecking(false);
    }
  };

  return {
    vpnStatus,
    checking,
    error,
    checkVPN
  };
};