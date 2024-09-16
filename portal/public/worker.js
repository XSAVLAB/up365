let countdownTimer = 0;
let intervalId = null;
let gameTimer = 180; // 3-minute game time

onmessage = function (e) {
  const { command } = e.data;

  if (command === "start") {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    const now = new Date();
    const currentTimeInSeconds = Math.floor(now.getTime() / 1000); // Get current time in seconds
    const timeSinceLastInterval = currentTimeInSeconds % gameTimer; // Calculate time since last 3-minute interval

    countdownTimer = gameTimer - timeSinceLastInterval; // Set countdown to remaining time

    // Start the countdown
    intervalId = setInterval(() => {
      if (countdownTimer <= 0) {
        countdownTimer = gameTimer;
      } else {
        countdownTimer -= 1;
      }

      postMessage({
        command: "update",
        timer: countdownTimer,
      });
    }, 1000); // Decrease every second
  }
};
