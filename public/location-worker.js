// Web Worker for background location and VPN checking
let locationCheckInterval;

self.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "START_LOCATION_CHECK":
      startLocationCheck();
      break;
    case "STOP_LOCATION_CHECK":
      stopLocationCheck();
      break;
    case "CHECK_VPN":
      await checkVPN(data.locationData);
      break;
  }
});

async function startLocationCheck() {
  // Check location permission status periodically
  locationCheckInterval = setInterval(async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      self.postMessage({
        type: "LOCATION_STATUS",
        status: permission.state,
      });
    } catch (error) {
      self.postMessage({
        type: "LOCATION_ERROR",
        error: error.message,
      });
    }
  }, 5000); // Check every 5 seconds
}

function stopLocationCheck() {
  if (locationCheckInterval) {
    clearInterval(locationCheckInterval);
  }
}

async function checkVPN(locationData) {
  try {
    let vpnDetected = false;
    const resultLocationData = {};

    if (locationData) {
      // Use GPS location data for VPN detection
      const { latitude, longitude, accuracy, isGPS } = locationData;

      // Copy location data
      resultLocationData.latitude = latitude;
      resultLocationData.longitude = longitude;
      resultLocationData.accuracy = accuracy;
      resultLocationData.isGPS = isGPS;

      // VPN detection based on GPS indicators
      // If the location is not GPS-based or has poor accuracy, it might be a VPN
      if (!isGPS || accuracy > 1000) {
        vpnDetected = true;
      }

      // Additional checks based on location accuracy
      if (accuracy > 5000) {
        // Very poor accuracy might indicate VPN/proxy
        vpnDetected = true;
      }

      // Check if coordinates are in common VPN/proxy ranges or suspicious locations
      // This is a simplified heuristic - you might want to expand this
      if (latitude === 0 && longitude === 0) {
        // Default coordinates often indicate VPN
        vpnDetected = true;
      }
    } else {
      // No location data provided
      vpnDetected = true;
      resultLocationData.error = "No location data provided";
    }

    self.postMessage({
      type: "VPN_CHECK_RESULT",
      vpnDetected,
      locationData: resultLocationData,
    });
  } catch (error) {
    console.error("VPN check error:", error);
    self.postMessage({
      type: "VPN_CHECK_ERROR",
      error: "Failed to check VPN status",
    });
  }
}
