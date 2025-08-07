import React, { useState, useEffect } from 'react';
import { Star, Gift, Coins, Sparkles, RotateCcw, Trophy, MapPin, Satellite } from 'lucide-react';

interface LotteryGameProps {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  locationData: {
    country?: string;
    city?: string;
    region?: string;
  };
  isWatching: boolean;
}

const LotteryGame: React.FC<LotteryGameProps> = ({ location, locationData, isWatching }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [credits, setCredits] = useState(100);

  const prizes = [
    { id: 1, name: 'جایزه طلایی', value: 1000, icon: Trophy, color: 'from-yellow-400 to-yellow-600' },
    { id: 2, name: 'جایزه نقره‌ای', value: 500, icon: Star, color: 'from-gray-300 to-gray-500' },
    { id: 3, name: 'جایزه برنزی', value: 250, icon: Gift, color: 'from-orange-400 to-orange-600' },
    { id: 4, name: 'سکه طلا', value: 100, icon: Coins, color: 'from-yellow-300 to-yellow-500' },
    { id: 5, name: 'امتیاز ویژه', value: 50, icon: Sparkles, color: 'from-purple-400 to-purple-600' },
    { id: 6, name: 'تلاش مجدد', value: 0, icon: RotateCcw, color: 'from-blue-400 to-blue-600' }
  ];

  const formatCoordinate = (coord: number, isLat: boolean) => {
    const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };
  const spinWheel = () => {
    if (credits < 10) return;
    
    setIsSpinning(true);
    setResult(null);
    setShowResult(false);
    setCredits(prev => prev - 10);

    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setResult(randomPrize.name);
      setIsSpinning(false);
      
      if (randomPrize.value > 0) {
        setCredits(prev => prev + randomPrize.value);
      }
      
      setTimeout(() => setShowResult(true), 500);
    }, 3000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">قرعه‌کشی طلایی</h1>
              <p className="text-sm text-white/70">
                {locationData.city && locationData.country 
                  ? `${locationData.city}، ${locationData.country}` 
                  : 'موقعیت شما'}
              </p>
              {location && (
                <div className="flex items-center mt-1 text-xs text-white/60">
                  <Satellite className={`w-3 h-3 ml-1 ${isWatching ? 'text-green-400' : 'text-red-400'}`} />
                  <span>
                    {formatCoordinate(location.latitude, true)} {formatCoordinate(location.longitude, false)}
                  </span>
                  <span className="mr-2">دقت: {Math.round(location.accuracy)}m</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 rounded-xl">
                <Coins className="w-5 h-5 text-white ml-2" />
                <span className="text-white font-bold">{credits.toLocaleString('fa-IR')}</span>
              </div>
              <p className="text-xs text-white/70 mt-1">امتیاز شما</p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-1 ${isWatching ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-white/60">
                  {isWatching ? 'موقعیت فعال' : 'موقعیت غیرفعال'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Location Status Alert */}
        {!isWatching && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-white">
                <MapPin className="w-5 h-5 ml-2 text-red-400" />
                <span className="font-medium">هشدار: ردیابی موقعیت غیرفعال است</span>
              </div>
              <p className="text-sm text-white/80 mt-1">
                برای ادامه بازی، لطفاً دسترسی به موقعیت را فعال نگه دارید
              </p>
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="max-w-2xl mx-auto">
          {/* Spinning Wheel */}
          <div className="relative mb-8">
            <div className={`w-80 h-80 mx-auto relative ${isSpinning ? 'animate-spin' : ''}`} 
                 style={{ animationDuration: isSpinning ? '3s' : '0s' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 p-2 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
                  {prizes.map((prize, index) => {
                    const angle = (360 / prizes.length) * index;
                    const IconComponent = prize.icon;
                    return (
                      <div
                        key={prize.id}
                        className={`absolute w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${prize.color} shadow-lg transform`}
                        style={{
                          transform: `rotate(${angle}deg) translateY(-100px)`,
                        }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    );
                  })}
                  
                  {/* Center Circle */}
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
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
            <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-2xl transform scale-105 transition-all duration-500">
              <div className="text-center text-white">
                <Trophy className="w-12 h-12 mx-auto mb-3 animate-bounce" />
                <h3 className="text-2xl font-bold mb-2">تبریک!</h3>
                <p className="text-xl">شما برنده <strong>{result}</strong> شدید!</p>
              </div>
            </div>
          )}

          {/* Spin Button */}
          <div className="text-center mb-8">
            <button
              onClick={spinWheel}
              disabled={isSpinning || credits < 10 || !isWatching}
              className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                isSpinning || credits < 10 || !isWatching
                  ? 'bg-gray-400 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95'
              } text-white`}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 ml-2 animate-spin" />
                  در حال چرخش...
                </div>
              ) : credits < 10 ? (
                'امتیاز کافی نیست'
              ) : !isWatching ? (
                'موقعیت غیرفعال است'
              ) : (
                <>
                  <Sparkles className="w-6 h-6 inline ml-2" />
                  چرخاندن چرخ شانس
                  <span className="block text-sm opacity-80">هزینه: ۱۰ امتیاز</span>
                </>
              )}
            </button>
          </div>

          {/* Prize List */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 text-center">جوایز قرعه‌کشی</h3>
            <div className="grid grid-cols-2 gap-4">
              {prizes.map((prize) => {
                const IconComponent = prize.icon;
                return (
                  <div key={prize.id} className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${prize.color} flex items-center justify-center ml-3`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{prize.name}</p>
                      <p className="text-white/70 text-sm">
                        {prize.value > 0 ? `${prize.value.toLocaleString('fa-IR')} امتیاز` : 'بدون هزینه'}
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