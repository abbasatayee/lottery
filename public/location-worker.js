// Web Worker for background location and VPN checking
let locationCheckInterval;

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'START_LOCATION_CHECK':
      startLocationCheck();
      break;
    case 'STOP_LOCATION_CHECK':
      stopLocationCheck();
      break;
    case 'CHECK_VPN':
      await checkVPN(data.ip);
      break;
  }
});

async function startLocationCheck() {
  // Check location permission status periodically
  locationCheckInterval = setInterval(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      self.postMessage({
        type: 'LOCATION_STATUS',
        status: permission.state
      });
    } catch (error) {
      self.postMessage({
        type: 'LOCATION_ERROR',
        error: error.message
      });
    }
  }, 5000); // Check every 5 seconds
}

function stopLocationCheck() {
  if (locationCheckInterval) {
    clearInterval(locationCheckInterval);
  }
}

async function checkVPN(userIP) {
  try {
    // Check multiple IP APIs to detect VPN
    const apis = [
      `https://ipapi.co/${userIP}/json/`,
      `https://ipinfo.io/${userIP}/json`,
      `https://ip-api.com/json/${userIP}`
    ];

    const results = await Promise.allSettled(
      apis.map(url => fetch(url).then(res => res.json()))
    );

    let vpnDetected = false;
    const locationData = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        
        // Check various VPN indicators
        if (data.proxy || data.vpn || data.hosting || 
            (data.org && data.org.toLowerCase().includes('vpn')) ||
            (data.isp && data.isp.toLowerCase().includes('vpn'))) {
          vpnDetected = true;
        }

        // Collect location data
        if (index === 0) { // Use first successful API for location
          locationData.country = data.country_name || data.country;
          locationData.city = data.city;
          locationData.region = data.region;
          locationData.ip = data.ip;
        }
      }
    });

    self.postMessage({
      type: 'VPN_CHECK_RESULT',
      vpnDetected,
      locationData
    });

  } catch (error) {
    self.postMessage({
      type: 'VPN_CHECK_ERROR',
      error: error.message
    });
  }
}