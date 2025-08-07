import React from 'react';
import { MapPin, Shield, AlertCircle, Satellite } from 'lucide-react';

interface LocationRequestProps {
  onRequestLocation: () => void;
  loading: boolean;
  error: string | null;
}

const LocationRequest: React.FC<LocationRequestProps> = ({
  onRequestLocation,
  loading,
  error
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Satellite className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              GPS Location Access Required
            </h1>
            <p className="text-gray-600">
              We need access to your precise GPS location to verify your eligibility for the lottery game.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span>Your GPS coordinates are secure and encrypted</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span>High accuracy location for fair play verification</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Satellite className="w-4 h-4 mr-2 text-green-500" />
              <span>Continuous monitoring during gameplay</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={onRequestLocation}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Getting GPS Location...
              </div>
            ) : (
              'Allow GPS Location Access'
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Click "Allow" when your browser prompts for precise location permission. Make sure location services are enabled on your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationRequest;