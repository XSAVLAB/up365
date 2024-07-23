let countdownTimer = 0;
let cooldown = 0;

onmessage = function (e) {
  const { command, timer, coolDown } = e.data;

  if (command === "start") {
    countdownTimer = timer;
    cooldown = coolDown;
    setInterval(() => {
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
