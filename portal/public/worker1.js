let countdownTimer = 0;
let intervalId = null;

onmessage = function (e) {
  const { command, timer } = e.data;

  if (command === "start") {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    // Calculate the reference time as 12:00:00 AM
    const now = new Date();
    const referenceTime = new Date(now);
    referenceTime.setHours(0, 0, 0, 0);

    // Calculate the time elapsed since the reference time
    const timeElapsedSinceReference = (now - referenceTime) / 1000;
    countdownTimer = 180 - Math.floor(timeElapsedSinceReference % 180);

    // Start the countdown
    intervalId = setInterval(() => {
      if (countdownTimer <= 0) {
        countdownTimer = 180;
      } else {
        countdownTimer -= 1;
      }
      postMessage({
        command: "update",
        timer: countdownTimer,
      });
    }, 1000);
  }
};
