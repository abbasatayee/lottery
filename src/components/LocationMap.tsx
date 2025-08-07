import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  ip_address: string;
  accuracy: number;
  speed?: number | null;
  altitude?: number | null;
}

interface LocationMapProps {
  locations: Location[];
  selectedIP?: string | null;
  onLocationClick?: (location: Location) => void;
  center?: { lat: number; lng: number };
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LocationMap: React.FC<LocationMapProps> = ({
  locations,
  selectedIP,
  onLocationClick,
  center = { lat: 40.7128, lng: -74.006 },
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 10);
    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location, index) => {
      const isSelected = selectedIP === location.ip_address;

      // Create custom icon based on selection
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="marker-content ${isSelected ? "selected" : ""}" style="
            background: ${isSelected ? "#3b82f6" : "#10b981"};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([location.latitude, location.longitude], {
        icon,
      }).addTo(mapInstanceRef.current!);

      // Create popup content
      const popupContent = `
        <div style="text-align: right; direction: rtl; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">موقعیت #${
            index + 1
          }</h4>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>IP:</strong> ${location.ip_address}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>دقت:</strong> ${location.accuracy}m
          </p>
          ${
            location.speed
              ? `<p style="margin: 4px 0; font-size: 12px;"><strong>سرعت:</strong> ${location.speed} m/s</p>`
              : ""
          }
          ${
            location.altitude
              ? `<p style="margin: 4px 0; font-size: 12px;"><strong>ارتفاع:</strong> ${location.altitude}m</p>`
              : ""
          }
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>زمان:</strong> ${new Date(
              location.timestamp
            ).toLocaleString("fa-IR")}
          </p>
          <p style="margin: 4px 0; font-size: 12px;">
            <strong>مختصات:</strong> ${location.latitude.toFixed(
              6
            )}, ${location.longitude.toFixed(6)}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on("click", () => {
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [locations, selectedIP, onLocationClick]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-screen rounded-lg shadow-lg"
        style={{ zIndex: 1 }}
      />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="text-sm text-gray-600 mb-2">کنترل‌های نقشه</div>
        <div className="space-y-2">
          <button
            onClick={() => {
              if (mapInstanceRef.current && markersRef.current.length > 0) {
                const group = new L.featureGroup(markersRef.current);
                mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
              }
            }}
            className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
          >
            نمایش همه نقاط
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setZoom(10);
              }
            }}
            className="w-full bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
          >
            تنظیم مجدد زوم
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3">
        <div className="text-sm text-gray-600 mb-2">راهنما</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 ml-2"></div>
            <span>موقعیت عادی</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 ml-2"></div>
            <span>موقعیت انتخاب شده</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
