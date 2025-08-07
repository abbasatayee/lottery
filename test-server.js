import express from "express";
import cors from "cors";
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Store received data
let receivedData = [];

app.post("/api/location", (req, res) => {
  const { latitude, longitude, additionalData } = req.body;

  const timestamp = new Date().toISOString();

  // Log the received data
  console.log("\n=== LOCATION DATA RECEIVED ===");
  console.log("Timestamp:", timestamp);
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  console.log("Accuracy:", additionalData.accuracy);
  console.log("Is GPS:", additionalData.isGPS);
  console.log("Accuracy Level:", additionalData.accuracyLevel);
  console.log("User Agent:", additionalData.userAgent);
  console.log("Screen Resolution:", additionalData.screenResolution);
  console.log("Timezone:", additionalData.timezone);
  console.log("Language:", additionalData.language);
  console.log("Platform:", additionalData.platform);
  console.log("Connection Type:", additionalData.connectionType);
  console.log("Battery Level:", additionalData.batteryLevel);
  console.log("Device Memory:", additionalData.deviceMemory);
  console.log("Hardware Concurrency:", additionalData.hardwareConcurrency);
  console.log("================================\n");

  // Store the data
  receivedData.push({
    timestamp,
    latitude,
    longitude,
    additionalData,
  });

  // Keep only last 100 entries
  if (receivedData.length > 100) {
    receivedData = receivedData.slice(-100);
  }

  // Send success response
  res.status(200).json({
    success: true,
    message: "Location data received",
    totalReceived: receivedData.length,
  });
});

// Endpoint to get all received data
app.get("/api/location/history", (req, res) => {
  res.json({
    totalReceived: receivedData.length,
    data: receivedData,
  });
});

// Endpoint to clear history
app.delete("/api/location/history", (req, res) => {
  receivedData = [];
  res.json({ success: true, message: "History cleared" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log("📡 Ready to receive location data every 5 seconds");
  console.log("📊 View history at: http://localhost:3000/api/location/history");
  console.log(
    "🗑️  Clear history: DELETE http://localhost:3000/api/location/history"
  );
  console.log("\nWaiting for location data...\n");
});
