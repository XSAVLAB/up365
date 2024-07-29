const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Settle Single Digit Lottery Bets every 120 seconds
exports.settleSingleDigitLotteryBets = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    await settleLotteryBets("Single Digit Lottery", 1, 9);
  });

// Settle Double Digit Lottery Bets every 300 seconds (5 minutes)
exports.settleDoubleDigitLotteryBets = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    await settleLotteryBets("Double Digit Lottery", 10, 99);
  });

// Settle Triple Digit Lottery Bets every 900 seconds (15 minutes)
exports.settleTripleDigitLotteryBets = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    await settleLotteryBets("Triple Digit Lottery", 100, 999);
  });

// Settle Color Ball Game Bets every 900 seconds (15 minutes)
exports.settleColorBallBets = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    await settleColorBallBets();
  });

const settleLotteryBets = async (gameType, minNumber, maxNumber) => {
  try {
    const betAmounts = [100, 250, 500, 750, 1000];

    for (const amount of betAmounts) {
      const betsSnapshot = await db
        .collection("gameBets")
        .where("settled", "==", false)
        .where("gameType", "==", gameType)
        .where("betAmount", "==", amount)
        .get();

      if (betsSnapshot.empty) continue;

      const bets = [];
      const betCount = {};
      let totalBetAmount = 0;

      betsSnapshot.forEach((betDoc) => {
        const betData = betDoc.data();
        bets.push({ id: betDoc.id, ...betData });
        betCount[betData.betNumber] = (betCount[betData.betNumber] || 0) + 1;
        totalBetAmount += betData.betAmount;
      });

      let winningNumber = null;
      let minBets = Infinity;
      const numbersWithNoBets = [];

      for (let number = minNumber; number <= maxNumber; number++) {
        if (!betCount[number]) {
          numbersWithNoBets.push(number);
        } else if (betCount[number] < minBets) {
          minBets = betCount[number];
          winningNumber = number;
        }
      }

      if (Object.keys(betCount).length === 1 || minBets === Infinity) {
        winningNumber =
          numbersWithNoBets.length > 0 ? numbersWithNoBets[0] : winningNumber;
      }

      const winners = bets.filter((bet) => bet.betNumber === winningNumber);
      const totalWinningAmount = (totalBetAmount * 0.8) / winners.length;

      for (const bet of bets) {
        const betRef = db.collection("gameBets").doc(bet.id);
        const userRef = db.collection("users").doc(bet.userID);
        const userDoc = await userRef.get();
        const userWallet = userDoc.data().wallet;

        if (winners.includes(bet)) {
          const updatedWallet = (
            parseInt(userWallet) + totalWinningAmount
          ).toString();
          await userRef.update({ wallet: updatedWallet });
          await betRef.update({
            rewardAmount: totalWinningAmount,
            settled: true,
            winningNumber,
          });
        } else {
          await betRef.update({
            settled: true,
            winningNumber,
            rewardAmount: 0,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error settling bets: ", error);
  }
};

const settleColorBallBets = async () => {
  try {
    const gameBetsRef = db.collection("gameBets");
    const unsettledBetsQuery = gameBetsRef
      .where("settled", "==", false)
      .where("gameType", "==", "Color Ball Game");
    const snapshot = await unsettledBetsQuery.get();
    const bets = [];
    const betCount = {};

    snapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      const combo = `${betData.ballColor}-${betData.betNumber}`;
      bets.push({ id: betDoc.id, ...betData });
      if (!betCount[combo]) {
        betCount[combo] = { count: 0, firstTimestamp: betData.timestamp };
      }
      betCount[combo].count += 1;
      if (betData.timestamp < betCount[combo].firstTimestamp) {
        betCount[combo].firstTimestamp = betData.timestamp;
      }
    });

    if (bets.length > 0) {
      let winningCombination = null;
      let minBets = Infinity;

      for (const combo in betCount) {
        if (
          betCount[combo].count < minBets ||
          (betCount[combo].count === minBets &&
            betCount[combo].firstTimestamp <
              betCount[winningCombination].firstTimestamp)
        ) {
          minBets = betCount[combo].count;
          winningCombination = combo;
        }
      }

      if (Object.keys(betCount).length === 1) {
        winningCombination = null;
      }

      const [winningColor, winningNumber] = winningCombination
        ? winningCombination.split("-")
        : [null, null];

      bets.forEach(async (bet) => {
        const betRef = db.collection("gameBets").doc(bet.id);
        const userRef = db.collection("users").doc(bet.userID);

        if (
          bet.ballColor === winningColor &&
          bet.betNumber === parseInt(winningNumber, 10)
        ) {
          const reward = bet.betAmount * 8;
          const userDoc = await userRef.get();
          const userWallet = userDoc.data().wallet;
          const updatedWallet = (parseInt(userWallet) + reward).toString();
          await userRef.update({ wallet: updatedWallet });
          await betRef.update({
            rewardAmount: reward,
            settled: true,
            winningColor,
            winningNumber: parseInt(winningNumber, 10),
          });
        } else {
          await betRef.update({
            settled: true,
            winningColor,
            winningNumber: parseInt(winningNumber, 10),
            rewardAmount: 0,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error settling bets: ", error);
  }
};
