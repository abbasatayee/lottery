import React, { useEffect, useState } from 'react';
import { useLocation } from './hooks/useLocation';
import { useVPN } from './hooks/useVPN';
import LocationRequest from './components/LocationRequest';
import VPNDetection from './components/VPNDetection';
import LotteryGame from './components/LotteryGame';

type AppState = 'location-request' | 'vpn-check' | 'lottery-game';

function App() {
  const [appState, setAppState] = useState<AppState>('location-request');
  const { location, error: locationError, loading: locationLoading, requestLocation, hasPermission, isWatching } = useLocation();
  const { vpnStatus, checking: vpnChecking, error: vpnError, checkVPN } = useVPN();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // Handle app state transitions
  useEffect(() => {
    if (!hasPermission || !location || !isWatching) {
      setAppState('location-request');
    } else if (location && hasPermission) {
      // Location granted, check VPN
      if (vpnStatus === null) {
        setAppState('vpn-check');
      } else if (vpnStatus.isVPN) {
        setAppState('vpn-check');
      } else {
        setAppState('lottery-game');
      }
    }
  }, [hasPermission, location, isWatching, vpnStatus]);

  const handleLocationRequest = async () => {
    await requestLocation();
  };

  const handleVPNCheck = async () => {
    await checkVPN();
  };

  // Render based on current state
  switch (appState) {
    case 'location-request':
      return (
        <LocationRequest
          onRequestLocation={handleLocationRequest}
          loading={locationLoading}
          error={locationError}
        />
      );

    case 'vpn-check':
      return (
        <VPNDetection
          onVPNCheck={handleVPNCheck}
          checking={vpnChecking}
          isVPN={vpnStatus?.isVPN ?? null}
          error={vpnError}
        />
      );

    case 'lottery-game':
      return (
        <LotteryGame
          location={location}
          locationData={vpnStatus?.locationData ?? {}}
          isWatching={isWatching}
        />
      );

    default:
      return (
        <LocationRequest
          onRequestLocation={handleLocationRequest}
          loading={locationLoading}
          error={locationError}
        />
      );
  }
}

export default App;