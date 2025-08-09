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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize hooks with error handling
  let locationHook, vpnHook, locationAPI;

  try {
    locationHook = useLocation();
    vpnHook = useVPN();
    locationAPI = useLocationAPI(
      locationHook.location,
      locationHook.isWatching
    );
  } catch (error) {
    console.error("Hook initialization error:", error);
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">خطا در بارگذاری برنامه</h1>
          <p>مشکلی در بارگذاری برنامه پیش آمده است.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-red-900 rounded"
          >
            بارگذاری مجدد
          </button>
        </div>
      </div>
    );
  }

  const {
    location,
    error: locationError,
    loading: locationLoading,
    requestLocation,
    hasPermission,
    isWatching,
    getLocationTips,
  } = locationHook;

  const {
    vpnStatus,
    checking: vpnChecking,
    error: vpnError,
    checkVPN,
  } = vpnHook;

  // Set loading to false after hooks are initialized
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

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
    }
  };

  const handleVPNCheck = async () => {
    if (location) {
      await checkVPN({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        isGPS: location.isGPS,
      });
    } else {
      await checkVPN();
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Render based on current state
  const renderContent = () => {
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
      <Route path="/" element={renderContent()} />
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="*" element={renderContent()} />
    </Routes>
  );
}

export default App;
