// timerUtils.js

// Common game timer duration in seconds (3 minutes)
export const GAME_TIMER_DURATION = 180;

// Function to calculate the initial countdown time based on the current time
export function calculateInitialCountdown() {
  const now = new Date();
  const secondsElapsed = now.getSeconds();
  const remainingTime =
    GAME_TIMER_DURATION - (secondsElapsed % GAME_TIMER_DURATION);
  return remainingTime;
}

// Format the countdown timer to MM:SS format
export function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
