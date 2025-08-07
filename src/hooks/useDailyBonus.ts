import { useState, useEffect } from "react";

interface UseDailyBonusReturn {
  canClaimBonus: boolean;
  lastClaimDate: string | null;
  claimDailyBonus: () => void;
  timeUntilNextBonus: string;
}

const DAILY_BONUS_STORAGE_KEY = "lottery_daily_bonus";
const DAILY_BONUS_AMOUNT = 50;

export const useDailyBonus = (): UseDailyBonusReturn => {
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [canClaimBonus, setCanClaimBonus] = useState(false);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(DAILY_BONUS_STORAGE_KEY);
      if (savedDate) {
        setLastClaimDate(savedDate);
        checkIfCanClaim(savedDate);
      } else {
        setCanClaimBonus(true);
      }
    } catch (error) {
      console.error("Error loading daily bonus data:", error);
      setCanClaimBonus(true);
    }
  }, []);

  const checkIfCanClaim = (lastClaim: string) => {
    const today = new Date().toDateString();
    const lastClaimDate = new Date(lastClaim).toDateString();
    setCanClaimBonus(today !== lastClaimDate);
  };

  const claimDailyBonus = () => {
    if (!canClaimBonus) return;

    const today = new Date().toDateString();
    try {
      localStorage.setItem(DAILY_BONUS_STORAGE_KEY, today);
      setLastClaimDate(today);
      setCanClaimBonus(false);
    } catch (error) {
      console.error("Error saving daily bonus data:", error);
    }
  };

  const getTimeUntilNextBonus = (): string => {
    if (canClaimBonus) return "آماده برای دریافت";

    if (!lastClaimDate) return "آماده برای دریافت";

    const now = new Date();
    const lastClaim = new Date(lastClaimDate);
    const tomorrow = new Date(lastClaim);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeDiff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} ساعت و ${minutes} دقیقه`;
  };

  return {
    canClaimBonus,
    lastClaimDate,
    claimDailyBonus,
    timeUntilNextBonus: getTimeUntilNextBonus(),
  };
};
