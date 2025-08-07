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
      await checkVPN(data.ip);
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

async function checkVPN(userIP) {
  try {
    // Use a more reliable VPN detection approach
    const apis = [
      `https://ipapi.co/${userIP}/json/`,
      `https://ipinfo.io/${userIP}/json`,
    ];

    let vpnDetected = false;
    const locationData = {};
    let successfulChecks = 0;

    for (const api of apis) {
      try {
        const response = await fetch(api, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; LotteryApp/1.0)",
          },
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        successfulChecks++;

        // Enhanced VPN detection logic
        const vpnIndicators = [
          data.proxy,
          data.vpn,
          data.hosting,
          data.tor,
          data.relay,
          data.org && data.org.toLowerCase().includes("vpn"),
          data.isp && data.isp.toLowerCase().includes("vpn"),
          data.org && data.org.toLowerCase().includes("proxy"),
          data.isp && data.isp.toLowerCase().includes("proxy"),
          data.org && data.org.toLowerCase().includes("hosting"),
          data.isp && data.isp.toLowerCase().includes("hosting"),
        ];

        if (vpnIndicators.some((indicator) => indicator === true)) {
          vpnDetected = true;
        }

        // Collect location data from first successful API
        if (Object.keys(locationData).length === 0) {
          locationData.country = data.country_name || data.country;
          locationData.city = data.city;
          locationData.region = data.region || data.region_name;
          locationData.ip = data.ip || userIP;
          locationData.org = data.org;
          locationData.isp = data.isp;
        }
      } catch (apiError) {
        console.log(`API ${api} failed:`, apiError);
        continue;
      }
    }

    // If no APIs worked, try a fallback approach
    if (successfulChecks === 0) {
      // Use a simple heuristic based on common VPN IP ranges
      const ipParts = userIP.split(".");
      const firstOctet = parseInt(ipParts[0]);

      // Common VPN/Proxy IP ranges (this is a simplified approach)
      const vpnRanges = [
        [1, 1],
        [1, 126], // Class A private
        [10, 10],
        [10, 10], // Private network
        [172, 16],
        [172, 31], // Private network
        [192, 168],
        [192, 168], // Private network
        [127, 127],
        [127, 127], // Loopback
      ];

      for (const [start, end] of vpnRanges) {
        if (firstOctet >= start && firstOctet <= end) {
          vpnDetected = true;
          break;
        }
      }

      locationData.ip = userIP;
      locationData.country = "Unknown";
      locationData.city = "Unknown";
    }

    self.postMessage({
      type: "VPN_CHECK_RESULT",
      vpnDetected,
      locationData,
    });
  } catch (error) {
    console.error("VPN check error:", error);
    self.postMessage({
      type: "VPN_CHECK_ERROR",
      error: "Failed to check VPN status",
    });
  }
}
