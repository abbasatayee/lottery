import React, { useEffect } from 'react';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface VPNDetectionProps {
  onVPNCheck: () => void;
  checking: boolean;
  isVPN: boolean | null;
  error: string | null;
}

const VPNDetection: React.FC<VPNDetectionProps> = ({
  onVPNCheck,
  checking,
  isVPN,
  error
}) => {
  useEffect(() => {
    // Auto-check VPN on mount
    onVPNCheck();
  }, [onVPNCheck]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500">
          <div className="mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              checking ? 'bg-blue-100' : isVPN ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {checking ? (
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
              ) : isVPN ? (
                <AlertTriangle className="w-10 h-10 text-red-600" />
              ) : (
                <Shield className="w-10 h-10 text-green-600" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {checking ? 'Verifying Connection...' : 
               isVPN ? 'VPN Detected' : 'Connection Verified'}
            </h1>
            
            <p className="text-gray-600">
              {checking ? 'Please wait while we verify your connection security.' :
               isVPN ? 'Please disable your VPN to continue.' :
               'Your connection has been verified successfully.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isVPN && !checking && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800">VPN or Proxy Detected</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    To ensure fair play and comply with regulations, please disable any VPN, proxy, or similar services.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onVPNCheck}
            disabled={checking}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
              checking
                ? 'bg-gray-400 cursor-not-allowed'
                : isVPN
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
            } shadow-lg hover:shadow-xl`}
          >
            {checking ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Checking Connection...
              </div>
            ) : isVPN ? (
              'Retry Verification'
            ) : (
              'Continue to Game'
            )}
          </button>

          {isVPN && (
            <p className="text-xs text-gray-500 mt-4">
              After disabling your VPN, click "Retry Verification" to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VPNDetection;