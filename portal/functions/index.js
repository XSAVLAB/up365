const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// Settle Single Digit Lottery Bets every 120 seconds
exports.settleSingleDigitLotteryBets = functions.pubsub
    .schedule("every 3 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Single Digit Lottery", 1, 9);
    });

// Settle Double Digit Lottery Bets every 300 seconds (5 minutes)
exports.settleDoubleDigitLotteryBets = functions.pubsub
    .schedule("every 3 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Double Digit Lottery", 10, 99);
    });

// Settle Triple Digit Lottery Bets every 900 seconds (15 minutes)
exports.settleTripleDigitLotteryBets = functions.pubsub
    .schedule("every 3 minutes")
    .onRun(async (context) => {
      await settleLotteryBets("Triple Digit Lottery", 100, 999);
    });

// Settle Color Ball Game Bets every 900 seconds (15 minutes)
exports.settleColorBallBets = functions.pubsub
    .schedule("every 3 minutes")
    .onRun(async (context) => {
      await settleColorBallBets();
    });

// New Firestore trigger function to notify admin on a new deposit request
exports.onNewTransaction = functions.firestore
    .document("transactions/{transactionId}")
    .onCreate(async (snapshot, context) => {
      const transaction = snapshot.data();

      // Check if the transaction status is 'pending'
      if (transaction && transaction.status === "pending") {
        try {
        // Update a notifications document for the admin
          await db
              .collection("notifications")
              .doc("admin")
              .set(
                  {
                    newRequest: true,
                    lastRequest: admin.firestore.FieldValue.serverTimestamp(),
                    message: `New deposit request for ₹${transaction.amount}`,
                  },
                  {merge: true},
              );
        } catch (error) {
          console.error("Error notifying admin:", error);
        }
      }
    });
// New Firestore trigger function to notify admin on a new withdrawal request
exports.onNewWithdrawal = functions.firestore
    .document("withdrawals/{withdrawalId}")
    .onCreate(async (snapshot, context) => {
      const withdrawal = snapshot.data();

      // Check if the withdrawal status is 'pending'
      if (withdrawal && withdrawal.status === "pending") {
        try {
        // Update a notifications document for the admin
          await db
              .collection("notifications")
              .doc("admin")
              .set(
                  {
                    newRequest: true,
                    lastRequest: admin.firestore.FieldValue.serverTimestamp(),
                    message: `New Withdrawal request for ₹${withdrawal.amount}`,
                  },
                  {merge: true},
              );
        } catch (error) {
          console.error("Error notifying admin:", error);
        }
      }
    });

// Aviator Game Crash Limit Function

// Function to update the current crash limit
exports.updateCurrentCrashLimit = functions.firestore
    .document("aviatorUserBets/{betId}")
    .onWrite(async (change, context) => {
    // Fetch all the pending bets
      const aviatorUserBetsRef = db.collection("aviatorUserBets");
      const snapshot = await aviatorUserBetsRef
          .where("status", "==", "pending")
          .get();

      const pendingBetsCount = snapshot.size; // Count of pending bets

      // Fetch the crash limits from the aviatorSettings collection
      const crashLimitsDoc = await db.doc("aviatorSettings/crashLimits").get();

      if (!crashLimitsDoc.exists) {
        console.error("Crash limits document not found.");
        return;
      }

      const crashLimits = crashLimitsDoc.data();

      let currentCrashLimit = {};

      // Determine the current crash limit based on the number of pending bets
      if (pendingBetsCount === 0) {
        currentCrashLimit = {
          minCrash: crashLimits.minCrashZero,
          maxCrash: crashLimits.maxCrashZero,
        };
      } else if (pendingBetsCount <= 2) {
        currentCrashLimit = {
          minCrash: crashLimits.minCrashOneTwo,
          maxCrash: crashLimits.maxCrashOneTwo,
        };
      } else {
        currentCrashLimit = {
          minCrash: crashLimits.minCrashThreePlus,
          maxCrash: crashLimits.maxCrashThreePlus,
        };
      }

      // Update the currentCrashLimit subcollection under aviatorSettings
      const currentCrashLimitRef = db.doc("aviatorSettings/currentCrashLimit");

      try {
        await currentCrashLimitRef.set(currentCrashLimit);
      } catch (error) {
        console.error("Error updating currentCrashLimit:", error);
      }
    });

// Lottery Bets Settling Function
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
        bets.push({id: betDoc.id, ...betData});
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
          await userRef.update({wallet: updatedWallet});
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

    const betGroups = {}; // Group bets by amount

    snapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      const combo = `${betData.ballColor}-${betData.betNumber}`;
      const amount = betData.betAmount;

      if (!betGroups[amount]) {
        betGroups[amount] = {bets: [], betCount: {}, totalBetAmount: 0};
      }

      betGroups[amount].bets.push({id: betDoc.id, ...betData});
      if (!betGroups[amount].betCount[combo]) {
        betGroups[amount].betCount[combo] = {
          count: 0,
          firstTimestamp: betData.timestamp,
        };
      }
      betGroups[amount].betCount[combo].count += 1;
      if (
        betData.timestamp < betGroups[amount].betCount[combo].firstTimestamp
      ) {
        betGroups[amount].betCount[combo].firstTimestamp = betData.timestamp;
      }
      betGroups[amount].totalBetAmount += betData.betAmount;
    });

    for (const amount in betGroups) {
      if (Object.prototype.hasOwnProperty.call(betGroups, amount)) {
        const {bets, betCount, totalBetAmount} = betGroups[amount];

        if (bets.length > 0) {
          let winningCombination = null;
          let minBets = Infinity;

          for (const combo in betCount) {
            if (Object.prototype.hasOwnProperty.call(betCount, combo)) {
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
          }

          if (Object.keys(betCount).length === 1) {
            winningCombination = null;
          }

          const [winningColor, winningNumber] = winningCombination ?
            winningCombination.split("-") :
            [null, null];

          const totalRewardAmount = totalBetAmount * 0.8;
          const winners = bets.filter(
              (bet) =>
                bet.ballColor === winningColor &&
              bet.betNumber === parseInt(winningNumber, 10),
          );

          const rewardPerWinner =
            winners.length > 0 ? totalRewardAmount / winners.length : 0;

          for (const bet of bets) {
            const betRef = db.collection("gameBets").doc(bet.id);
            const userRef = db.collection("users").doc(bet.userID);

            if (winners.includes(bet)) {
              const userDoc = await userRef.get();
              const userWallet = userDoc.data().wallet;
              const updatedWallet = (
                parseInt(userWallet) + rewardPerWinner
              ).toString();
              await userRef.update({wallet: updatedWallet});
              await betRef.update({
                rewardAmount: rewardPerWinner,
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
          }
        }
      }
    }
  } catch (error) {
    console.error("Error settling bets: ", error);
  }
};

// Aviator Functions

const GAME_STATE_COLLECTION = "aviatorGameState";
const GAME_STATE_DOC = "currentState";
const TIMER = 10;
// Function to sleep for a specified time in milliseconds
/**
 * Sleeps for a specified time in milliseconds.
 * @param {number} ms - The time to sleep in milliseconds.
 * @return {Promise} - Resolves after the specified time.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.onAviatorGameStateChange = functions.firestore
    .document("aviatorGameState/currentState")
    .onUpdate(async (change, context) => {
      const newState = change.after.data();

      if (newState.state === "betting" && newState.timer === 0) {
        await flyingPlane();
      }

      // If the game state is 'flying' and the plane has crashed
      if (newState.state === "crashed") {
        await bettingTime();
      }
    });

// Function to update the current game state
/**
 * Updates the current game state in Firestore.
 * @param {Object} state - The new game state.
 * @return {Promise} - Firestore write promise.
 */
async function updateGameState(state) {
  return db
      .collection(GAME_STATE_COLLECTION)
      .doc(GAME_STATE_DOC)
      .set(state, {merge: true});
}

// Function for betting time timer
/**
 * Simulates a timer for the betting time.
 * @return {Promise} - Resolves after 15 seconds.
 */
async function bettingTime() {
  // Set the state to 'betting' with a timer of 15 seconds
  await updateGameState({
    state: "betting",
    timer: TIMER,
  });

  // Countdown
  for (let i = TIMER; i > -1; i--) {
    if (i === 0) {
      await updateGameState({timer: 0});
    }
    await sleep(1000);
  }
}

// Function for flying the plane/multiplier
/**
 * Simulates the plane flying and the multiplier increasing.
 * @return {Promise} - Resolves when the plane crashes.
 */
async function flyingPlane() {
  let multiplier = 1;
  const minCrash = 1.01;
  const maxCrash = 5;
  const crashPoint = Math.random() * (maxCrash - minCrash) + minCrash;
  const startTime = Date.now();
  await updateGameState({
    state: "flying",
    minCrash: minCrash,
    maxCrash: maxCrash,
    crashPoint: crashPoint.toFixed(2),
    startTime: startTime,
  });

  const interval = setInterval(async () => {
    multiplier *= 1.01;

    // Check if the plane should crash
    if (multiplier >= crashPoint) {
      clearInterval(interval);
      await updateGameState({
        state: "crashed",
      });
    }
  }, 100);
}

// Function to dynamically calculate the current multiplier
/**
 * Calculates the current multiplier based on the time elapsed.
 * @param {number} startTime - The time the plane started flying.
 * @return {string} - The current multiplier.
 */
function getCurrentMultiplier(startTime) {
  const elapsed = (Date.now() - startTime) / 100;
  const multiplier = Math.pow(1.01, elapsed);
  return multiplier.toFixed(2);
}

// HTTP callable function to get the current multiplier
exports.getCurrentMultiplier = functions.https.onCall(async (data, context) => {
  // Get the current game state to access startTime
  const gameStateDoc = await db
      .collection(GAME_STATE_COLLECTION)
      .doc(GAME_STATE_DOC)
      .get();

  const gameState = gameStateDoc.data();

  if (gameState.state === "flying") {
    const currentMultiplier = getCurrentMultiplier(gameState.startTime);
    return {multiplier: currentMultiplier};
  } else {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The plane is not flying.",
    );
  }
});
