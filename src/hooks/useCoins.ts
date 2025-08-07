import { useState, useEffect } from "react";

interface UseCoinsReturn {
  credits: number;
  setCredits: (credits: number) => void;
  addCredits: (amount: number) => void;
  subtractCredits: (amount: number) => void;
  resetCredits: () => void;
}

const COINS_STORAGE_KEY = "lottery_coins";
const DEFAULT_CREDITS = 100;

export const useCoins = (): UseCoinsReturn => {
  const [credits, setCreditsState] = useState<number>(DEFAULT_CREDITS);

  // Load credits from localStorage on mount
  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem(COINS_STORAGE_KEY);
      if (savedCredits) {
        const parsedCredits = parseInt(savedCredits, 10);
        if (!isNaN(parsedCredits) && parsedCredits >= 0) {
          setCreditsState(parsedCredits);
        }
      }
    } catch (error) {
      console.error("Error loading credits from localStorage:", error);
    }
  }, []);

  // Save credits to localStorage whenever credits change
  const setCredits = (newCredits: number) => {
    try {
      setCreditsState(newCredits);
      localStorage.setItem(COINS_STORAGE_KEY, newCredits.toString());
    } catch (error) {
      console.error("Error saving credits to localStorage:", error);
    }
  };

  const addCredits = (amount: number) => {
    setCredits(credits + amount);
  };

  const subtractCredits = (amount: number) => {
    const newAmount = Math.max(0, credits - amount);
    setCredits(newAmount);
  };

  const resetCredits = () => {
    setCredits(DEFAULT_CREDITS);
  };

  return {
    credits,
    setCredits,
    addCredits,
    subtractCredits,
    resetCredits,
  };
};
