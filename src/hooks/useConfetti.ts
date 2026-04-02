import confetti from "canvas-confetti";
import { useCallback } from "react";

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4a8c5c", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"],
    });
  }, []);

  return { fireConfetti };
}
