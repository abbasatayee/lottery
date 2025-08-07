import React from "react";
import { Shield, AlertCircle, Satellite } from "lucide-react";

interface LocationRequestProps {
  onRequestLocation: () => void;
  loading: boolean;
  error: string | null;
  locationTips?: string[];
}

const LocationRequest: React.FC<LocationRequestProps> = ({
  onRequestLocation,
  loading,
  error,
  locationTips = [],
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-right transform transition-all duration-500 hover:scale-105">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Satellite className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-right">
              مجوزهای ضروری مورد نیاز
            </h1>
            <p className="text-gray-600 text-right">
              برای ادامه، لطفاً مجوزهای ضروری را تأیید کنید. یک پنجره مجوز در
              مرورگر شما ظاهر خواهد شد.
            </p>
          </div>

          <div className="space-y-4 mb-6 flex flex-col items-end">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-right">
                اطلاعات شما کاملاً امن و رمزگذاری شده است
              </span>
              <Shield className="w-4 h-4 ml-2 text-green-500" />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>برای تأیید هویت و امنیت بازی</span>
              <Shield className="w-4 h-4 ml-2 text-green-500" />
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>نظارت مداوم برای اطمینان از امنیت</span>
              <Satellite className="w-4 h-4 ml-2 text-green-500" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {locationTips.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 text-right">
                نکات مهم:
              </h3>
              <ul className="space-y-1 flex flex-col items-end">
                {locationTips.map((tip, index) => (
                  <li
                    key={index}
                    className="text-xs text-blue-700 list-none flex items-start text-right"
                  >
                    <span className="text-blue-500 ml-2 text-right">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={onRequestLocation}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                در حال دریافت مجوز...
              </div>
            ) : (
              "درخواست مجوزهای ضروری"
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-right">
            وقتی پنجره مجوز ظاهر شد، روی "اجازه" کلیک کنید. این مجوزها برای
            امنیت و تأیید هویت شما ضروری هستند.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationRequest;
