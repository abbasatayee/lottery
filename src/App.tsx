import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { useVPN } from "./hooks/useVPN";
import { useLocation } from "./hooks/useLocation";
import { useLocationAPI } from "./hooks/useLocationAPI";
import LotteryGame from "./components/LotteryGame";
import VPNDetection from "./components/VPNDetection";
import LocationRequest from "./components/LocationRequest";
import AdminLayout from "./components/AdminLayout";

type AppState = "location-request" | "vpn-check" | "lottery-game";

function App() {
  const [appState, setAppState] = useState<AppState>("location-request");
  const [locationTips, setLocationTips] = useState<string[]>([]);
  const {
    location,
    error: locationError,
    loading: locationLoading,
    requestLocation,
    hasPermission,
    isWatching,
    getLocationTips,
  } = useLocation();
  const {
    vpnStatus,
    checking: vpnChecking,
    error: vpnError,
    checkVPN,
  } = useVPN();

  // Use the location API hook to send data every 5 seconds
  const locationAPI = useLocationAPI(location, isWatching);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
          // Don't throw error, just log it
        });
    }
  }, []);

  // Log location API status
  useEffect(() => {
    if (locationAPI.isSending) {
      console.log("Sending location data to API...");
    }
    if (locationAPI.lastSent) {
      console.log("Location data sent at:", locationAPI.lastSent);
    }
    if (locationAPI.error) {
      console.error("Location API error:", locationAPI.error);
    }
  }, [locationAPI.isSending, locationAPI.lastSent, locationAPI.error]);

  // Load location tips
  useEffect(() => {
    const loadLocationTips = async () => {
      try {
        const tips = await getLocationTips();
        setLocationTips(tips);
      } catch (error) {
        console.error("Error loading location tips:", error);
        setLocationTips([
          "VPN را غیرفعال کنید",
          "وقتی درخواست شد، اجازه دهید",
          "برای سیگنال بهتر، به فضای باز بروید",
          "مرورگر خود را بررسی کنید",
        ]);
      }
    };

    loadLocationTips();
  }, [getLocationTips]);

  // Handle app state transitions
  useEffect(() => {
    if (!hasPermission || !location || !isWatching) {
      setAppState("location-request");
    } else if (location && hasPermission) {
      // Location granted, check VPN
      if (vpnStatus === null) {
        setAppState("vpn-check");
      } else if (vpnStatus.isVPN) {
        setAppState("vpn-check");
      } else {
        setAppState("lottery-game");
      }
    }
  }, [hasPermission, location, isWatching, vpnStatus]);

  const handleLocationRequest = async () => {
    try {
      await requestLocation();
    } catch (error) {
      console.error("Error requesting location:", error);
      // Error is already handled by the useLocation hook
    }
  };

  const handleVPNCheck = async () => {
    await checkVPN();
  };

  // Main lottery app component
  const LotteryApp = () => {
    // Render based on current state
    switch (appState) {
      case "location-request":
        return (
          <LocationRequest
            onRequestLocation={handleLocationRequest}
            loading={locationLoading}
            error={locationError}
            locationTips={locationTips}
          />
        );

      case "vpn-check":
        return (
          <VPNDetection
            onVPNCheck={handleVPNCheck}
            checking={vpnChecking}
            isVPN={vpnStatus?.isVPN ?? null}
            error={vpnError}
          />
        );

      case "lottery-game":
        return (
          <LotteryGame
            location={location}
            locationData={vpnStatus?.locationData ?? {}}
            isWatching={isWatching}
            apiStatus={locationAPI}
          />
        );

      default:
        return (
          <LocationRequest
            onRequestLocation={handleLocationRequest}
            loading={locationLoading}
            error={locationError}
            locationTips={locationTips}
          />
        );
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LotteryApp />} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="*" element={<LotteryApp />} />
    </Routes>
  );
}

export default App;
