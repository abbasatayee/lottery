# Lottery Game

A React-based lottery game application with location tracking and VPN detection features.

## Features

- **Location Tracking**: Real-time GPS location monitoring with accuracy detection
- **VPN Detection**: Automatic VPN/proxy detection to ensure fair play
- **Lottery Game**: Interactive spinning wheel with various prizes
- **Daily Bonus**: Claim daily bonuses for additional credits
- **Location API Integration**: Automatically sends location data to API endpoint every 5 seconds

## Location API Integration

The application automatically sends location data to `https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io/api/location` every 5 seconds when location tracking is active. The data includes:

### Request Format

```json
{
  "latitude": number,
  "longitude": number,
  "additionalData": {
    "accuracy": number,
    "timestamp": number,
    "isGPS": boolean,
    "accuracyLevel": "high" | "medium" | "low",
    "userAgent": string,
    "screenResolution": string,
    "timezone": string,
    "language": string,
    "platform": string,
    "connectionType": string,
    "batteryLevel": number,
    "deviceMemory": number,
    "hardwareConcurrency": number
  }
}
```

### API Status Indicators

The application displays real-time status indicators for the location API:

- **Green**: Data sent successfully
- **Yellow**: Currently sending data
- **Red**: Error occurred while sending data

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Production API Endpoint

The application sends location data to the production API endpoint at [https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io](https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io/) that accepts POST requests with the location data format shown above.

### Available Endpoints:

- **POST /api/location**: Store location data
- **GET /api/locations**: Get all stored locations
- **GET /api/stats**: Get location statistics
- **GET /api/search**: Search locations with filters
- **GET /admin/send-location**: Admin endpoint to send location data via query parameters

### API Response Format:

```json
{
  "message": "Location stored successfully",
  "id": 3,
  "data": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "::ffff:10.190.12.64",
    "additionalData": {
      "building": "Empire State",
      "floor": 86,
      "room": "observation"
    },
    "requestInfo": {
      "host": "cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io",
      "method": "POST",
      "url": "/api/location",
      "protocol": "http"
    },
    "geolocationInfo": {
      "accuracy": 15,
      "altitude": 50,
      "speed": 3.5
    },
    "browserInfo": {
      "timezone": "America/New_York",
      "deviceMemory": 16,
      "hardwareConcurrency": 12,
      "platform": "MacIntel"
    },
    "networkInfo": {
      "connectionType": "wifi",
      "effectiveType": "4g",
      "downlink": 10,
      "rtt": 50
    }
  }
}
```

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (Icons)
- Geolocation API
- Web Workers (for background location monitoring)
