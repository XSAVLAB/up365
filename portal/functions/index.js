const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Settle Single Digit Lottery Bets every 120 seconds
exports.settleSingleDigitLotteryBets = functions.pubsub
    .schedule("every 2 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Single Digit Lottery");
    });

// Settle Double Digit Lottery Bets every 300 seconds (5 minutes)
exports.settleDoubleDigitLotteryBets = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Double Digit Lottery");
    });

// Settle Triple Digit Lottery Bets every 900 seconds (15 minutes)
exports.settleTripleDigitLotteryBets = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Triple Digit Lottery");
    });

// Settle Color Ball Game Bets every 900 seconds (15 minutes)
exports.settleColorBallBets = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async (context) => {
      await settleColorBallBets();
    });

const settleLotteryBets = async (gameType) => {
  try {
    const gameBetsRef = db.collection("gameBets");
    const unsettledBetsQuery = gameBetsRef
        .where("settled", "==", false)
        .where("gameType", "==", gameType);
    const snapshot = await unsettledBetsQuery.get();
    const bets = [];
    const betCount = {};
    snapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      bets.push({id: betDoc.id, ...betData});
      betCount[betData.betNumber] = (betCount[betData.betNumber] || 0) + 1;
    });
    if (bets.length > 0) {
      let winningNumber = null;
      let minBets = Infinity;
      for (const number in betCount) {
        if (betCount[number] < minBets) {
          minBets = betCount[number];
          winningNumber = parseInt(number, 10);
        }
      }
      if (Object.keys(betCount).length === 1) {
        winningNumber = null;
      }
      bets.forEach(async (bet) => {
        const betRef = db.collection("gameBets").doc(bet.id);
        const userRef = db.collection("users").doc(bet.userID);
        if (bet.betNumber === winningNumber) {
          const reward = bet.betAmount * 8;
          const userDoc = await userRef.get();
          const userWallet = userDoc.data().wallet;
          const updatedWallet = (parseInt(userWallet) + reward).toString();
          await userRef.update({wallet: updatedWallet});
          await betRef.update({
            rewardAmount: reward,
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
      });
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
      bets.push({id: betDoc.id, ...betData});
      if (!betCount[combo]) {
        betCount[combo] = {count: 0, firstTimestamp: betData.timestamp};
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

      const [winningColor, winningNumber] = winningCombination?
        winningCombination.split("-"):
        [null, null];

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
          await userRef.update({wallet: updatedWallet});
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
