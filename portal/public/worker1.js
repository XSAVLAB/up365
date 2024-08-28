let countdownTimer = 0;
let cooldown = 0;
let intervalId = null;

onmessage = function (e) {
  const { command, timer, coolDown } = e.data;

  if (command === "start") {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }

    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const nextQuarter = Math.ceil(minutes / 2) * 2;
    const remainingMinutes = (nextQuarter - minutes) % 60;
    const remainingSeconds = 60 - seconds;

    countdownTimer = remainingMinutes * 60 + remainingSeconds;
    cooldown = coolDown;

    intervalId = setInterval(() => {
      if (countdownTimer === 0) {
        postMessage({ command: "settleBets" });
        countdownTimer = 120;
        cooldown = 10;
      } else if (cooldown !== 0) {
        cooldown -= 1;
      } else {
        countdownTimer -= 1;
      }
      postMessage({
        command: "update",
        timer: countdownTimer,
        coolDown: cooldown,
      });
    }, 1000);
  }
};
