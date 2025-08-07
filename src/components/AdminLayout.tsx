import React, { useState, useEffect } from "react";
import { MapPin, Globe, Users, Clock, Database } from "lucide-react";
import LocationMap from "./LocationMap";

interface LocationData {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  user_agent: string;
  ip_address: string;
  host: string;
  referer: string | null;
  origin: string | null;
  method: string;
  url: string;
  protocol: string;
  headers: string;
  server_hostname: string;
  server_platform: string;
  server_arch: string;
  server_node_version: string;
  server_uptime: number;
  accuracy: number;
  altitude: number | null;
  altitude_accuracy: number | null;
  heading: number | null;
  speed: number | null;
  additional_data: string | null;
  timezone: string;
  language: string | null;
  screen_resolution: string | null;
  device_memory: number | null;
  hardware_concurrency: number | null;
  connection_type: string | null;
  effective_type: string | null;
  downlink: number | null;
  rtt: number | null;
  platform: string | null;
  vendor: string | null;
  cookie_enabled: number | null;
  do_not_track: string | null;
  custom_fields: string | null;
}

interface GroupedLocation {
  ip_address: string;
  locations: LocationData[];
  count: number;
  firstSeen: string;
  lastSeen: string;
  coordinates: { lat: number; lng: number };
}

interface ApiResponse {
  count: number;
  locations: LocationData[];
}

const AdminLayout: React.FC = () => {
  const [groupedLocations, setGroupedLocations] = useState<GroupedLocation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io/api/locations"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Group locations by IP address
      const grouped = groupLocationsByIP(data.locations);
      setGroupedLocations(grouped);

      // Set map center to the first location or default
      if (grouped.length > 0) {
        setMapCenter(grouped[0].coordinates);
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const groupLocationsByIP = (locations: LocationData[]): GroupedLocation[] => {
    const grouped: { [key: string]: LocationData[] } = {};

    locations.forEach((location) => {
      const ip = location.ip_address;
      if (!grouped[ip]) {
        grouped[ip] = [];
      }
      grouped[ip].push(location);
    });

    return Object.entries(grouped)
      .map(([ip, locations]) => {
        const sortedLocations = locations.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        return {
          ip_address: ip,
          locations: sortedLocations,
          count: locations.length,
          firstSeen: sortedLocations[0].timestamp,
          lastSeen: sortedLocations[sortedLocations.length - 1].timestamp,
          coordinates: {
            lat: sortedLocations[0].latitude,
            lng: sortedLocations[0].longitude,
          },
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("fa-IR");
  };

  const getLocationDetails = (location: LocationData) => {
    const additionalData = location.additional_data
      ? JSON.parse(location.additional_data)
      : {};
    const customFields = location.custom_fields
      ? JSON.parse(location.custom_fields)
      : {};

    return {
      accuracy: location.accuracy,
      altitude: location.altitude,
      speed: location.speed,
      timezone: location.timezone,
      platform: location.platform,
      vendor: location.vendor,
      deviceMemory: location.device_memory,
      hardwareConcurrency: location.hardware_concurrency,
      connectionType: location.connection_type,
      effectiveType: location.effective_type,
      downlink: location.downlink,
      rtt: location.rtt,
      additionalData,
      customFields,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
            <Database className="h-8 w-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            خطا در بارگذاری
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLocationData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-white shadow-lg border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-blue-600 rounded-lg p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  پنل مدیریت موقعیت‌ها
                </h1>
                <p className="text-gray-600">
                  نمایش و مدیریت داده‌های موقعیت کاربران
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-sm text-gray-500">تعداد آدرس‌های IP</p>
                <p className="text-2xl font-bold text-blue-600">
                  {groupedLocations.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">کل موقعیت‌ها</p>
                <p className="text-2xl font-bold text-green-600">
                  {groupedLocations.reduce(
                    (sum, group) => sum + group.count,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full h-full flex">
          {/* IP List Sidebar */}
          <div className="w-80 bg-white shadow-lg border-l flex-shrink-0 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 ml-2 text-blue-600" />
                آدرس‌های IP
              </h2>
              <div className="space-y-3">
                {groupedLocations.map((group) => (
                  <div
                    key={group.ip_address}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedIP === group.ip_address
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedIP(group.ip_address)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-2 text-gray-500" />
                        <span className="font-mono text-sm text-gray-700">
                          {group.ip_address}
                        </span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {group.count}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>اولین بازدید:</span>
                        <span>{formatTimestamp(group.firstSeen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>آخرین بازدید:</span>
                        <span>{formatTimestamp(group.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 flex flex-col">
            {/* Map Container */}
            <div className="flex-1 relative">
              <LocationMap
                locations={groupedLocations.flatMap((group) => group.locations)}
                selectedIP={selectedIP}
                center={mapCenter}
                onLocationClick={(location) => {
                  // Find the IP for this location and select it
                  const ipGroup = groupedLocations.find((group) =>
                    group.locations.some((loc) => loc.id === location.id)
                  );
                  if (ipGroup) {
                    setSelectedIP(ipGroup.ip_address);
                  }
                }}
              />
            </div>

            {/* Details Panel */}
            {selectedIP && (
              <div className="h-96 bg-white shadow-lg border-t overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-4 w-4 ml-2 text-orange-600" />
                    جزئیات آدرس IP: {selectedIP}
                  </h3>

                  <div className="space-y-4">
                    {groupedLocations
                      .find((group) => group.ip_address === selectedIP)
                      ?.locations.map((location, index) => {
                        const details = getLocationDetails(location);
                        return (
                          <div
                            key={location.id}
                            className="border rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  موقعیت #{index + 1}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formatTimestamp(location.timestamp)}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="text-sm text-gray-500">
                                  دقت: {location.accuracy}m
                                </p>
                                {location.speed && (
                                  <p className="text-sm text-gray-500">
                                    سرعت: {location.speed} m/s
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">مختصات:</p>
                                <p className="font-mono">
                                  {location.latitude}, {location.longitude}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">منطقه زمانی:</p>
                                <p>{location.timezone}</p>
                              </div>
                              {location.platform && (
                                <div>
                                  <p className="text-gray-600">پلتفرم:</p>
                                  <p>{location.platform}</p>
                                </div>
                              )}
                              {location.vendor && (
                                <div>
                                  <p className="text-gray-600">تولیدکننده:</p>
                                  <p>{location.vendor}</p>
                                </div>
                              )}
                              {details.deviceMemory && (
                                <div>
                                  <p className="text-gray-600">حافظه دستگاه:</p>
                                  <p>{details.deviceMemory} GB</p>
                                </div>
                              )}
                              {details.hardwareConcurrency && (
                                <div>
                                  <p className="text-gray-600">هسته‌های CPU:</p>
                                  <p>{details.hardwareConcurrency}</p>
                                </div>
                              )}
                              {details.connectionType && (
                                <div>
                                  <p className="text-gray-600">نوع اتصال:</p>
                                  <p>{details.connectionType}</p>
                                </div>
                              )}
                              {details.effectiveType && (
                                <div>
                                  <p className="text-gray-600">نوع مؤثر:</p>
                                  <p>{details.effectiveType}</p>
                                </div>
                              )}
                            </div>

                            {Object.keys(details.additionalData).length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                  اطلاعات اضافی:
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {Object.entries(details.additionalData).map(
                                    ([key, value]) => (
                                      <div key={key}>
                                        <span className="text-gray-600">
                                          {key}:
                                        </span>
                                        <span className="mr-2">
                                          {String(value)}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
