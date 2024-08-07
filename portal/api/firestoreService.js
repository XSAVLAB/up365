import { db } from "../firebaseConfig";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  increment,
  where,
} from "firebase/firestore";

//==============================Utility Section================================//

export const handleChange = (profileData, setProfileData) => (e) => {
  const { name, value } = e.target;
  setProfileData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

//========================Profile Management Section===========================//

// Fetch Profile Data
export const fetchProfileData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile data: ", error);
    throw error;
  }
};

// Update Profile
export const updateProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, profileData, { merge: true });
    console.log("Profile data stored in Firestore");
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw error;
  }
};

// Create Profile
export const createProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, profileData);
  } catch (error) {
    console.error("Error creating profile: ", error);
    throw error;
  }
};

//============================Transaction Section==============================//

// Update Settings
export const updateSettings = async (userId, settingsData) => {
  try {
    const userDocRef = doc(db, "cardDetails", userId);
    await setDoc(userDocRef, {
      ...settingsData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error updating settings: ", error);
    throw error;
  }
};

// Update Card Details
export const updateUserCardDetails = async (userId, cardDetails) => {
  try {
    const userDocRef = doc(db, "cardDetails", userId);
    await setDoc(userDocRef, { ...cardDetails, timestamp: new Date() });
    console.log("User card details updated in Firestore");
  } catch (error) {
    console.error("Error updating user card details: ", error);
    throw error;
  }
};

// Deposits
export const addDepositRequest = async (userId, transactionData) => {
  try {
    const transactionCollectionRef = collection(db, "deposits");
    await addDoc(transactionCollectionRef, {
      ...transactionData,
      userId,
      timestamp: new Date().toLocaleString(),
    });
    console.log("Transaction added to Firestore");
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

// Withdrawals
export const addWithdrawalRequest = async (userId, amount) => {
  try {
    const withdrawalCollectionRef = collection(db, "withdrawals");
    await addDoc(withdrawalCollectionRef, {
      userId,
      amount,
      status: "pending",
      timestamp: new Date().toLocaleString(),
    });
    console.log("Withdrawal request stored in Firestore");
  } catch (error) {
    console.error("Error storing withdrawal request: ", error);
    throw error;
  }
};

// Fetch user wallet by user ID
export const fetchUserWallet = async (userId) => {
  console.log("userId", userId);
  try {
    console.log("userId", userId);
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().wallet;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user wallet: ", error);
    throw error;
  }
};

// Function to update user wallet
export const updateUserWallet = async (userId, newBalance) => {
  const userWalletRef = doc(db, "users", userId);
  await updateDoc(userWalletRef, {
    wallet: newBalance.toString(),
  });
};

// Fetch balance history
export const fetchBalanceHistory = async (userId) => {
  try {
    const transactionsCollectionRef = collection(db, "transactions");
    const withdrawalsCollectionRef = collection(db, "withdrawals");

    const transactionsSnapshot = await getDocs(transactionsCollectionRef);
    const withdrawalsSnapshot = await getDocs(withdrawalsCollectionRef);

    const transactionsData = transactionsSnapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => ({ id: doc.id, type: "Deposit", ...doc.data() }));

    const withdrawalsData = withdrawalsSnapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => ({ id: doc.id, type: "Withdrawal", ...doc.data() }));

    const combinedData = [...transactionsData, ...withdrawalsData];
    return combinedData;
  } catch (error) {
    console.error("Error fetching balance history: ", error);
    throw error;
  }
};

//===============================Match Section=================================//

// Fetch Cricket Matches
export const fetchCricketMatches = async () => {
  try {
    const matchDataCollection = collection(db, "cricketData");
    const q = query(matchDataCollection, where("active", "==", true));
    const matchDataSnapshot = await getDocs(q);
    const matchData = matchDataSnapshot.docs.flatMap(
      (doc) => doc.data().matches
    );
    return matchData;
  } catch (error) {
    console.error("Error fetching match data: ", error);
    throw error;
  }
};

// Fetch Football Matches
export const fetchFootballMatches = async () => {
  try {
    const matchDataCollection = collection(db, "footballData");
    const matchDataSnapshot = await getDocs(matchDataCollection);
    const matchData = matchDataSnapshot.docs.flatMap(
      (doc) => doc.data().matches
    );
    return matchData;
  } catch (error) {
    console.error("Error fetching match data: ", error);
    throw error;
  }
};
//================================Bets Section=================================//
// Place a Bet
export const placeBet = async (betData) => {
  try {
    const {
      userId,
      betAmount,
      possibleWin,
      selectedTeam,
      team1,
      team2,
      selectedOdds,
      matchId,
      currentBalance,
      betType,
      blockNumber,
      tableType,
      seriesName,
      matchType,
    } = betData;

    if (betAmount > currentBalance) {
      throw new Error("Insufficient balance");
    }

    const betDocRef = await addDoc(collection(db, "bets"), {
      userId,
      team1: team1,
      team2: team2,
      betAmount,
      odds: selectedOdds,
      possibleWin,
      selectedTeam: selectedTeam === "team1" ? team1 : team2,
      timestamp: new Date().toISOString(),
      status: "pending",
      matchId,
      settled: false,
      betType,
      blockNumber,
      tableType,
      seriesName,
      matchType,
    });

    await updateDoc(doc(db, "bets", betDocRef.id), { id: betDocRef.id });

    await updateDoc(doc(db, "users", userId), {
      wallet: (currentBalance - betAmount).toString(),
    });

    return `Bet of $${betAmount} placed on ${
      selectedTeam === "team1" ? team1 : team2
    }`;
  } catch (error) {
    console.error("Error placing bet: ", error);
    throw error;
  }
};

// Function to fetch user bets
export const fetchUserBets = async (userId) => {
  const db = getFirestore();
  const q = query(
    collection(db, "bets"),
    where("userId", "==", userId),
    where("settled", "==", false)
  );
  const betsSnapshot = await getDocs(q);
  return betsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

//==========================Games Section=============================//
// Update Lottery Bets
export const submitLotteryBet = async (
  userID,
  betNumber,
  betAmount,
  gameType,
  ballColor,
  settled
) => {
  try {
    const betData = {
      userID,
      betNumber,
      betAmount,
      gameType,
      ballColor,
      settled,
      timestamp: new Date(),
    };
    await addDoc(collection(db, "gameBets"), betData);
    return { status: "Bet Placed" };
  } catch (error) {
    console.error("Error placing bet: ", error);
    throw new Error("Bet placement failed");
  }
};

// Fetch Lottery Bets
export const fetchLotteryBets = async (userId) => {
  try {
    const db = getFirestore();
    const q = query(
      collection(db, "gameBets"),
      where("userID", "==", userId),
      where("settled", "==", false)
      // where("gameType", "==", gameType)
    );
    const betsSnapshot = await getDocs(q);
    return betsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching user bets: ", error);
    throw error;
  }
};

// Fetch all lottery bets
export const fetchAllLotteryBets = async (userId, gameType) => {
  try {
    const db = getFirestore();

    const betsSnapshot = await getDocs(
      collection(db, "gameBets"),
      where("userID", "==", userId),
      where("gameType", "==", gameType)
    );
    return betsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching all bets: ", error);
    throw error;
  }
};

// Settle Lottery Bets
export const settleLotteryBets = async (gameType) => {
  try {
    const db = getFirestore();
    const gameBetsRef = collection(db, "gameBets");
    const unsettledBetsQuery = query(
      gameBetsRef,
      where("settled", "==", false),
      where("gameType", "==", gameType)
    );
    const snapshot = await getDocs(unsettledBetsQuery);
    const bets = [];
    const betCount = {};
    snapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      bets.push({ id: betDoc.id, ...betData });
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
        const betRef = doc(db, "gameBets", bet.id);
        const userRef = doc(db, "users", bet.userID);
        if (bet.betNumber === winningNumber) {
          const reward = bet.betAmount * 1.5;
          const userDoc = await getDoc(userRef);
          const userWallet = userDoc.data().wallet;
          const updatedWallet = (parseInt(userWallet) + reward).toString();
          await updateDoc(userRef, { wallet: updatedWallet });
          await updateDoc(betRef, {
            rewardAmount: reward,
            settled: true,
            winningNumber,
          });
        } else {
          await updateDoc(betRef, {
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

// Settle color ball bets

export const settleColorBallBets = async () => {
  try {
    const db = getFirestore();
    const gameBetsRef = collection(db, "gameBets");
    const unsettledBetsQuery = query(
      gameBetsRef,
      where("settled", "==", false),
      where("gameType", "==", "Color Ball Game")
    );
    const snapshot = await getDocs(unsettledBetsQuery);
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
        const betRef = doc(db, "gameBets", bet.id);
        const userRef = doc(db, "users", bet.userID);

        if (
          bet.ballColor === winningColor &&
          bet.betNumber === parseInt(winningNumber, 10)
        ) {
          const reward = bet.betAmount * 1.5;
          const userDoc = await getDoc(userRef);
          const userWallet = userDoc.data().wallet;
          const updatedWallet = (parseInt(userWallet) + reward).toString();
          await updateDoc(userRef, { wallet: updatedWallet });
          await updateDoc(betRef, {
            rewardAmount: reward,
            settled: true,
            winningColor,
            winningNumber: parseInt(winningNumber, 10),
          });
        } else if (
          (gameBetsRef,
          where("settled", "==", false),
          where("gameType", "==", "Color Ball Game"))
        ) {
          await updateDoc(betRef, {
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
// Fetch winning bets
export const fetchWinningBets = async () => {
  try {
    const db = getFirestore();
    const gameBetsRef = collection(db, "gameBets");
    const settledBetsQuery = query(gameBetsRef, where("settled", "==", true));
    const snapshot = await getDocs(settledBetsQuery);
    const winningBets = {};
    snapshot.forEach((betDoc) => {
      const betData = betDoc.data();
      if (!winningBets[betData.gameType]) {
        winningBets[betData.gameType] = {
          gameType: betData.gameType,
          winningNumber: betData.winningNumber,
          winningColor: betData.winningColor,
          winners: 0,
          totalWon: 0,
        };
      }
      if (betData.rewardAmount > 0) {
        winningBets[betData.gameType].winners += 1;
        winningBets[betData.gameType].totalWon += betData.rewardAmount;
      }
    });
    return Object.values(winningBets);
  } catch (error) {
    console.error("Error fetching winning bets: ", error);
    throw error;
  }
};
