const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

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
/**
 * Updates the status of all pending bets to 'crashed'.
 *  @return {Promise} - Resolves when all bets are updated.
 */
async function updateBetStatus() {
  const betsRef = db.collection("aviatorUserBets");
  const pendingBetsQuery = betsRef.where("status", "==", "pending");

  const querySnapshot = await pendingBetsQuery.get();

  const updatePromises = querySnapshot.docs.map((doc) => {
    return doc.ref.update({status: "crashed"});
  });

  await Promise.all(updatePromises);
}

// Function for betting time timer
/**
 * Simulates a timer for the betting time.
 * @return {Promise} - Resolves after 15 seconds.
 */
async function bettingTime() {
  // Set the state to 'betting' with a timer of 15 seconds
  const betStartTime = Date.now();

  // Create a new round for this betting session
  const newRoundRef = db.collection("aviatorBetRounds").doc();
  await newRoundRef.set({
    betStartTime: betStartTime,
    isCompleted: false,
    userCount: 0,
    totalBetAmount: 0,
  });

  // Update game state
  await updateGameState({
    state: "betting",
    betStartTime: betStartTime,
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
  const crashLimitRef = db.collection("aviatorSettings")
      .doc("currentCrashLimit");
  const crashLimitSnapshot = await crashLimitRef.get();

  if (!crashLimitSnapshot.exists) {
    throw new Error("Crash limits document does not exist");
  }

  const crashLimits = crashLimitSnapshot.data();
  const minCrash = crashLimits.minLimit || 1.01;
  const maxCrash = crashLimits.maxLimit || 5;

  let multiplier = 1;
  const crashPoint = Math.random() * (maxCrash - minCrash) + minCrash;
  const roundStartTime = Date.now();

  // Update game state to "flying"
  await updateGameState({
    state: "flying",
    minCrash: minCrash,
    maxCrash: maxCrash,
    crashPoint: crashPoint.toFixed(2),
    roundStartTime: roundStartTime,
  });
  await markRoundAsCompleted();
  const interval = setInterval(async () => {
    multiplier *= 1.01;

    if (multiplier >= crashPoint) {
      clearInterval(interval);

      await updateBetStatus();
      await updateGameState({
        state: "crashed",
      });
    }
  }, 100);
}

/**
 * @param {number} roundStartTime - The time the plane started flying.
 */
async function markRoundAsCompleted() {
  const roundRef = db.collection("aviatorBetRounds")
      .where("isCompleted", "==", false);
  const roundSnapshot = await roundRef.get();

  if (!roundSnapshot.empty) {
    const batch = db.batch();
    roundSnapshot.forEach((doc) => {
      batch.update(doc.ref, {isCompleted: true});
    });
    await batch.commit();
  }
}


// Function to dynamically calculate the current multiplier
/**
 * Calculates the current multiplier based on the time elapsed.
 * @param {number} roundStartTime - The time the plane started flying.
 * @return {string} - The current multiplier.
 */
function getCurrentMultiplier(roundStartTime) {
  const elapsed = (Date.now() - roundStartTime) / 100;
  const multiplier = Math.pow(1.01, elapsed);
  return multiplier.toFixed(2);
}

// HTTP callable function to get the current multiplier
exports.getCurrentMultiplier = functions.https.onCall(async (data, context) => {
  // Get the current game state to access roundStartTime
  const gameStateDoc = await db
      .collection(GAME_STATE_COLLECTION)
      .doc(GAME_STATE_DOC)
      .get();

  const gameState = gameStateDoc.data();

  if (gameState.state === "flying") {
    const currentMultiplier = getCurrentMultiplier(gameState.roundStartTime);
    return {multiplier: currentMultiplier};
  } else {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The plane is not flying.",
    );
  }
});

// Grouping the bets by rounds
exports.groupAviatorBets = functions.firestore
    .document("aviatorUserBets/{betId}")
    .onCreate(async (snapshot, context) => {
      const betData = snapshot.data();
      const betStartTime = betData.betStartTime;
      const betAmount = betData.betAmount;

      try {
        let roundId;

        // Start Firestore transaction
        await db.runTransaction(async (transaction) => {
          // Query for a round with the same betStartTime
          const roundQuerySnapshot = await transaction.get(
              db
                  .collection("aviatorBetRounds")
                  .where("betStartTime", "==", betStartTime)
                  .limit(1),
          );

          const userCountIncrement = 1;

          if (!roundQuerySnapshot.empty) {
            // Round already exists, retrieve the round ID
            const round = roundQuerySnapshot.docs[0];
            roundId = round.id;

            // Increment the userCount and totalBetAmount in the round document
            transaction.update(db.collection("aviatorBetRounds").doc(roundId), {
              userCount: admin.firestore.FieldValue
                  .increment(userCountIncrement),
              totalBetAmount: admin.firestore.FieldValue
                  .increment(betAmount),
            });
          } else {
            const allRoundsSnapshot = await transaction.get(
                db.collection("aviatorBetRounds"),
            );

            // Mark all previous rounds as completed
            allRoundsSnapshot.forEach((doc) => {
              transaction.update(doc.ref, {isCompleted: true});
            });
          }

          // Add the bet to the round's 'bets' subcollection
          transaction.set(
              db
                  .collection("aviatorBetRounds")
                  .doc(roundId)
                  .collection("bets")
                  .doc(snapshot.id),
              betData,
          );
        });

        console.log(`Bet ${snapshot.id} added to round ${roundId}`);
      } catch (error) {
        console.error(
            "Error grouping bet into a round and updating user count: ",
            error,
        );
      }
    });

// Function to update crash limits based on user count in aviatorBetRounds
exports.updateCrashLimitsOnRoundChange = functions.firestore
    .document("aviatorBetRounds/{roundId}")
    .onWrite(async (change, context) => {
      const roundData = change.after.exists ? change.after.data() : null;

      if (!roundData) {
        return;
      }

      const {userCount, isCompleted} = roundData;

      if (isCompleted) {
        const activeRoundsSnapshot = await db.collection("aviatorBetRounds")
            .where("isCompleted", "==", false)
            .limit(1)
            .get();

        if (activeRoundsSnapshot.empty) {
          await updateCrashLimitsBasedOnUserCount(0);
        }
        return;
      }

      await updateCrashLimitsBasedOnUserCount(userCount);
    });

/**
 * Updates the crash limits based on the user count.
 * @param {number} userCount - The number of users in the round.
 */
async function updateCrashLimitsBasedOnUserCount(userCount) {
  const crashLimitsRef = db.collection("aviatorSettings")
      .doc("crashLimits");
  const crashLimitsSnapshot = await crashLimitsRef.get();

  if (!crashLimitsSnapshot.exists) {
    throw new Error("Crash limits document does not exist");
  }

  const crashLimits = crashLimitsSnapshot.data();

  let minLimit;
  let maxLimit;

  if (userCount === 0) {
    minLimit = crashLimits.minCrashZero;
    maxLimit = crashLimits.maxCrashZero;
  } else if (userCount === 1 || userCount === 2) {
    minLimit = crashLimits.minCrashOneTwo;
    maxLimit = crashLimits.maxCrashOneTwo;
  } else if (userCount >= 3) {
    minLimit = crashLimits.minCrashThreePlus;
    maxLimit = crashLimits.maxCrashThreePlus;
  }

  const currentCrashLimitRef = db.collection("aviatorSettings")
      .doc("currentCrashLimit");
  await currentCrashLimitRef.set(
      {
        minLimit,
        maxLimit,
      },
      {merge: true},
  );
}


/**
 *
 * @return {Promise} - Resolves when the game state is updated.
 */
async function fetchCricketData() {
  const API_KEY = "2dc77f32-82dc-4048-9b54-50baa8ab8ef8";
  const url = `https://api.cricapi.com/v1/cricScore?apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cricket data:", error);
    throw error;
  }
}

/**
 * @param {Array} matches - The cricket matches to group.
 * @return {Object} - The cricket matches grouped by series.
*/
function groupMatchesBySeries(matches) {
  return matches.reduce((acc, match) => {
    const seriesName = match.series
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "_");
    if (!seriesName) {
      console.error("Invalid series name:", match.series);
      return acc;
    }
    if (!acc[seriesName]) {
      acc[seriesName] = [];
    }
    acc[seriesName].push(match);
    return acc;
  }, {});
}

/**
 * @param {Object} seriesMatches - The cricket matches grouped by series.
*/
async function storeCricketMatchesInFirestore(seriesMatches) {
  const batch = db.batch();
  for (const [seriesName, matches] of Object.entries(seriesMatches)) {
    const seriesDocRef = db.collection("cricketData").doc(seriesName);
    batch.set(seriesDocRef, {matches}, {merge: true});
  }
  await batch.commit();
  console.log("Cricket matches stored in Firestore successfully");
}

exports.updateCricketMatches = functions.pubsub
    .schedule("every 15 minutes")
    .onRun(async (context) => {
      try {
        // Fetch cricket data from the API
        const cricketMatches = await fetchCricketData();

        // Group matches by series
        const seriesMatches = groupMatchesBySeries(cricketMatches);

        // Store cricket matches in Firestore
        await storeCricketMatchesInFirestore(seriesMatches);

        console.log("Cricket data update complete");
      } catch (error) {
        console.error("Error updating cricket matches:", error);
      }
    });
