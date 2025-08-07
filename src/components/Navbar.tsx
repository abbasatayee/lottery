import React from "react";
import { Coins, Crown, Menu, X, Trophy, Sparkles, Gift } from "lucide-react";

interface NavbarProps {
  credits: number;
  isWatching: boolean;
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onResetCredits?: () => void;
  onClaimDailyBonus?: () => void;
  canClaimBonus?: boolean;
  timeUntilNextBonus?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  credits,
  isWatching,
  onMenuToggle,
  isMenuOpen = false,
  onResetCredits,
  onClaimDailyBonus,
  canClaimBonus = false,
  timeUntilNextBonus = "",
}) => {
  return (
    <nav
      dir="rtl"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-lg border-b border-white/10 shadow-2xl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white text-right">
                قرعه‌کشی طلایی
              </h1>
              <p className="text-xs text-white/70 text-right">
                بازی شانس و هیجان
              </p>
            </div>
          </div>

          {/* Credits Display */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Credits Card */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl px-4 py-2">
              <div className="flex items-center">
                <Coins className="w-5 h-5 text-yellow-400 ml-2" />
                <div>
                  <div className="text-white font-bold text-sm">
                    {credits.toLocaleString("fa-IR")}
                  </div>
                  <div className="text-yellow-300 text-xs">امتیاز</div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
              <div
                className={`w-2 h-2 rounded-full ml-2 ${
                  isWatching ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              ></div>
              <span className="text-white/80 text-xs">
                {isWatching ? "فعال" : "غیرفعال"}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="sm:hidden w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-white/10 mt-2 pb-4">
            <div className="flex flex-col space-y-3 space-y-reverse pt-4">
              {/* Mobile Status */}
              <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ml-2 ${
                      isWatching ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  ></div>
                  <span className="text-white/80 text-sm">
                    سیستم: {isWatching ? "فعال" : "غیرفعال"}
                  </span>
                </div>
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>

              {/* Daily Bonus */}
              {onClaimDailyBonus && (
                <button
                  onClick={onClaimDailyBonus}
                  disabled={!canClaimBonus}
                  className={`w-full backdrop-blur-sm border rounded-xl p-3 text-center transition-all duration-200 ${
                    canClaimBonus
                      ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/30"
                      : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Gift className="w-4 h-4 ml-2" />
                    <div className="text-xs">
                      {canClaimBonus ? "جایزه روزانه" : "جایزه روزانه"}
                    </div>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {canClaimBonus ? "+۵۰ امتیاز" : timeUntilNextBonus}
                  </div>
                </button>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-3 text-center">
                  <div className="text-blue-300 text-xs text-right">
                    جایزه امروز
                  </div>
                  <div className="text-white font-bold text-lg text-right">
                    ۰
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-3 text-center">
                  <div className="text-green-300 text-xs text-right">
                    کل امتیاز
                  </div>
                  <div className="text-white font-bold text-lg text-right">
                    {credits.toLocaleString("fa-IR")}
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              {onResetCredits && (
                <button
                  onClick={onResetCredits}
                  className="w-full bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 text-center text-red-300 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-200"
                >
                  <div className="text-red-300 text-xs text-right">
                    بازنشانی امتیاز
                  </div>
                  <div className="text-white font-bold text-sm text-right">
                    ۱۰۰ امتیاز
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
