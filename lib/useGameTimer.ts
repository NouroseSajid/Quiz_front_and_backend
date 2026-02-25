/**
 * Custom hook for game timer with pause/extend capability
 * 
 * Automatically triggers reveal when timer hits 0
 * Supports pause and extend operations by host
 */

import { useState, useEffect, useCallback } from "react";

export interface TimerState {
  timeLeft: number;
  isPaused: boolean;
  totalTime: number;
}

export function useGameTimer(
  questionStartTime: Date | string | null,
  questionTimeLimit: number,
  onTimerComplete?: () => void
) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(questionTimeLimit);

  // Calculate time remaining
  const calculateTimeLeft = useCallback(() => {
    if (!questionStartTime) return questionTimeLimit;

    const startTime = typeof questionStartTime === "string" ? new Date(questionStartTime) : questionStartTime;
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  }, [questionStartTime, questionTimeLimit, totalSeconds]);

  // Main timer loop
  useEffect(() => {
    if (!questionStartTime) return;

    const timer = setInterval(() => {
      if (isPaused && pausedTime !== null) {
        setTimeLeft(pausedTime);
        return;
      }

      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Auto-trigger reveal when timer hits 0
      if (remaining === 0 && onTimerComplete) {
        onTimerComplete();
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [questionStartTime, isPaused, pausedTime, calculateTimeLeft, onTimerComplete]);

  const pauseTimer = useCallback(() => {
    if (!isPaused) {
      setPausedTime(timeLeft);
      setIsPaused(true);
    }
  }, [timeLeft, isPaused]);

  const resumeTimer = useCallback(() => {
    if (isPaused) {
      setPausedTime(null);
      setIsPaused(false);
    }
  }, [isPaused]);

  const addTime = useCallback((secondsToAdd: number) => {
    setTotalSeconds((prev) => prev + secondsToAdd);
    if (isPaused && pausedTime !== null) {
      setPausedTime(Math.min(pausedTime + secondsToAdd, totalSeconds + secondsToAdd));
    }
  }, [isPaused, pausedTime, totalSeconds]);

  const setTime = useCallback((newTime: number) => {
    setTotalSeconds(newTime);
    if (isPaused) {
      setPausedTime(Math.min(timeLeft, newTime));
    }
  }, [timeLeft, isPaused]);

  return {
    timeLeft,
    isPaused,
    totalSeconds,
    pauseTimer,
    resumeTimer,
    addTime,
    setTime,
  };
}
