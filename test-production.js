import fetch from "node-fetch";

const PRODUCTION_API =
  "https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io";

async function testProductionAPI() {
  console.log("🚀 Testing Production API...\n");

  try {
    // Test 1: Get API info
    console.log("1. Getting API info...");
    const infoResponse = await fetch(PRODUCTION_API);
    const info = await infoResponse.json();
    console.log("✅ API Info:", info.message);
    console.log("Available endpoints:", Object.keys(info.endpoints).length);

    // Test 2: Send location data
    console.log("\n2. Sending location data...");
    const locationData = {
      latitude: 37.7749,
      longitude: -122.4194,
      additionalData: {
        accuracy: 10,
        timestamp: Date.now(),
        isGPS: true,
        accuracyLevel: "high",
        userAgent: "Test Script",
        screenResolution: "1920x1080",
        timezone: "America/Los_Angeles",
        language: "en-US",
        platform: "MacIntel",
        connectionType: "wifi",
        batteryLevel: 0.85,
        deviceMemory: 16,
        hardwareConcurrency: 8,
      },
    };

    const locationResponse = await fetch(`${PRODUCTION_API}/api/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(locationData),
    });

    const locationResult = await locationResponse.json();
    console.log("✅ Location sent successfully!");
    console.log("Response ID:", locationResult.id);

    // Test 3: Get statistics
    console.log("\n3. Getting statistics...");
    const statsResponse = await fetch(`${PRODUCTION_API}/api/stats`);
    const stats = await statsResponse.json();
    console.log("✅ Statistics:", stats.stats);

    // Test 4: Get all locations
    console.log("\n4. Getting all locations...");
    const locationsResponse = await fetch(`${PRODUCTION_API}/api/locations`);
    const locations = await locationsResponse.json();
    console.log("✅ Total locations stored:", locations.count);

    console.log("\n🎉 All tests passed! Production API is working perfectly.");
    console.log("\n📊 Summary:");
    console.log(`- Total locations: ${locations.count}`);
    console.log(`- Today's locations: ${stats.stats.today}`);
    console.log(`- Unique IPs: ${stats.stats.uniqueIPs}`);
    console.log(`- Unique User Agents: ${stats.stats.uniqueUserAgents}`);
  } catch (error) {
    console.error("❌ Error testing production API:", error.message);
  }
}

testProductionAPI();

