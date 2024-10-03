import { db } from "../firebaseConfig";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  increment,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { parse } from "date-fns";

export const handleChange = (profileData, setProfileData) => (e) => {
  const { name, value } = e.target;
  setProfileData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};
// Format timestamp

const formatTimestamp = () => {
  const now = new Date();
  const hours = now.getHours();
  const formattedHours = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  const formattedTimestamp = `${String(now.getDate()).padStart(
    2,
    "0"
  )}/${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}, ${String(formattedHours).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} ${ampm}`;

  return formattedTimestamp;
};

// Fetch balance history
export const fetchBalanceHistory = async (userId) => {
  try {
    const transactionsCollectionRef = query(
      collection(db, "transactions")
      // where("status", "==", "approved")
    );
    const withdrawalsCollectionRef = query(
      collection(db, "withdrawals")
      // where("status", "==", "approved")
    );

    const transactionsSnapshot = await getDocs(transactionsCollectionRef);
    const withdrawalsSnapshot = await getDocs(withdrawalsCollectionRef);

    const transactionsData = transactionsSnapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => ({ id: doc.id, type: "Deposit", ...doc.data() }));

    const withdrawalsData = withdrawalsSnapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => ({ id: doc.id, type: "Withdrawal", ...doc.data() }));

    const combinedData = [...transactionsData, ...withdrawalsData];
    return combinedData.sort((a, b) => {
      const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching balance history: ", error);
    throw error;
  }
};

// Profile management functions:

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
    profileData.timestamp = formatTimestamp();
    profileData.wallet = "0";
    profileData.role = "user";
    profileData.isBlocked = false;
    profileData.hasSeenBonus = false;
    await setDoc(userDocRef, profileData);
  } catch (error) {
    console.error("Error creating profile: ", error);
    throw error;
  }
};
// Settings management functions:

// Update Settings
export const updateSettings = async (userId, settingsData) => {
  try {
    const userDocRef = doc(db, "cardDetails", userId);
    await setDoc(userDocRef, {
      ...settingsData,
      timestamp: formatTimestamp(),
    });
  } catch (error) {
    console.error("Error updating settings: ", error);
    throw error;
  }
};

// Update Password

export const updatePasswordInFirebase = async (
  email,
  currentPassword,
  newPassword
) => {
  try {
    // Re-authenticate user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      currentPassword
    );

    // Update password
    await updatePassword(userCredential.user, newPassword);

    return { success: true };
  } catch (error) {
    console.error("Error updating password: ", error);
    return { success: false, errorMessage: error.message };
  }
};

// Settings management functions:

// Update Card Details
export const updateUserCardDetails = async (userId, cardDetails) => {
  try {
    const userDocRef = doc(db, "cardDetails", userId);
    await setDoc(userDocRef, {
      ...cardDetails,
      timestamp: formatTimestamp(),
    });
    console.log("User card details updated in Firestore");
  } catch (error) {
    console.error("Error updating user card details: ", error);
    throw error;
  }
};

// Transactions
export const addTransaction = async (userId, transactionData) => {
  try {
    const transactionCollectionRef = collection(db, "transactions");
    await addDoc(transactionCollectionRef, {
      ...transactionData,
      userId,
      timestamp: formatTimestamp(),
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

export const fetchDepositCredited = async (userId) => {
  try {
    const depositCreditedCollectionRef = collection(db, "transactions");
    const q = query(
      depositCreditedCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "approved"),
      where("isSuccessShown", "==", false)
    );
    const querySnapshot = await getDocs(q);
    const depositCredited = querySnapshot.docs.map((doc) => {
      const { amount, isSuccessShown } = doc.data();
      return { amount, isSuccessShown };
    });

    return depositCredited;
  } catch (error) {
    console.error("Error fetching successful deposits:", error);
    throw error;
  }
};
export const updateSuccessDepositMessage = async (userId) => {
  try {
    const depositCreditedCollectionRef = collection(db, "transactions");
    const q = query(
      depositCreditedCollectionRef,
      where("userId", "==", userId),
      where("isSuccessShown", "==", false)
    );

    const querySnapshot = await getDocs(q);

    // Iterate over each document and update the field
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { isSuccessShown: true });
    });
  } catch (error) {
    console.error("Error updating successful deposits message:", error);
    throw error;
  }
};

// Fetch all pending withdrawal requests for the user
export const fetchPendingWithdrawals = async (userId) => {
  try {
    const withdrawalCollectionRef = collection(db, "withdrawals");
    const q = query(
      withdrawalCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    const pendingWithdrawals = querySnapshot.docs.map((doc) => doc.data());
    return pendingWithdrawals;
  } catch (error) {
    console.error("Error fetching pending withdrawals:", error);
    throw error;
  }
};

// Withdrawals
export const addWithdrawalRequest = async (
  userId,
  amount,
  accountNumber,
  ifscCode,
  bankName,
  branchName,
  accountHolderName,
  upiID
) => {
  try {
    const withdrawalCollectionRef = collection(db, "withdrawals");
    await addDoc(withdrawalCollectionRef, {
      userId,
      amount,
      status: "pending",
      timestamp: formatTimestamp(),
      accountNumber,
      ifscCode,
      bankName,
      branchName,
      accountHolderName,
      upiID,
    });

    console.log("Withdrawal request stored in Firestore");
  } catch (error) {
    console.error("Error storing withdrawal request: ", error);
    throw error;
  }
};

// // Fetch user wallet by user ID
export const fetchUserWallet = async (userId) => {
  try {
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

// Fetch and listen to changes in the user's wallet balance
export const fetchUserWalletOnUpdate = (userId, onUpdate) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const wallet = doc.data().wallet;
        onUpdate(wallet);
      } else {
        console.error("User document does not exist");
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error fetching and listening to user wallet: ", error);
    throw error;
  }
};

// Fetch active series match data from Firestore
export const fetchFootballMatches = async () => {
  try {
    const matchDataCollection = collection(db, "footballData");
    // const q = query(matchDataCollection, where("active", "==", true));
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

// Fetch User Balance (for use in FooterCard component)
export const fetchUserBalance = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData.wallet;
    } else {
      throw new Error("No wallet found for user");
    }
  } catch (error) {
    console.error("Error fetching balance: ", error);
    throw error;
  }
};

// Place a Bet (for use in FooterCard component)
export const placeBet = async (betData) => {
  try {
    const {
      userId,
      betAmount,
      possibleWin,
      selectedTeam,
      t1,
      t2,
      t1odds,
      t2odds,
      matchId,
      currentBalance,
    } = betData;
    if (betAmount > currentBalance) {
      throw new Error("Insufficient balance");
    }

    const betDocRef = await addDoc(collection(db, "sportsBets"), {
      userId,
      team1: t1,
      team2: t2,
      betAmount,
      odds: selectedTeam === "t1" ? t1odds.toString() : t2odds.toString(),
      possibleWin,
      selectedTeam: selectedTeam === "t1" ? t1 : t2,
      timestamp: formatTimestamp(),
      status: "pending",
      matchId,
      settled: false,
    });

    await updateDoc(doc(db, "sportsBets", betDocRef.id), { id: betDocRef.id });

    await updateDoc(doc(db, "users", userId), {
      wallet: (currentBalance - betAmount).toString(),
    });

    return `Bet of ₹${betAmount} placed on ${selectedTeam === "t1" ? t1 : t2}`;
  } catch (error) {
    console.error("Error placing bet: ", error);
    throw error;
  }
};

// Function to add a bet
export const addBet = async (betData) => {
  const db = getFirestore();
  const betRef = await addDoc(collection(db, "sportsBets"), betData);
  await updateDoc(betRef, {
    id: betRef.id,
  });
  return betRef.id;
};

// Function to update user wallet
export const updateUserWallet = async (userId, newBalance) => {
  const db = getFirestore();
  const userWalletRef = doc(db, "users", userId);
  await updateDoc(userWalletRef, {
    wallet: newBalance.toString(),
  });
};

// Function to fetch user bets
export const fetchUserBets = async (userId) => {
  const db = getFirestore();
  const q = query(
    collection(db, "sportsBets"),
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
      timestamp: formatTimestamp(),
    };
    await addDoc(collection(db, "gameBets"), betData);
    return { status: "Bet Placed" };
  } catch (error) {
    console.error("Error placing bet: ", error);
    throw new Error("Bet placement failed");
  }
};

// Fetch and listen to Lottery Bets
export const fetchLotteryBets = (userId, gameType, onUpdate) => {
  try {
    const db = getFirestore();
    const betsQuery = query(
      collection(db, "gameBets"),
      where("userID", "==", userId),
      where("settled", "==", false),
      where("gameType", "==", gameType)
    );

    const unsubscribe = onSnapshot(betsQuery, (betsSnapshot) => {
      const bets = betsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedBets = bets.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });
      onUpdate(sortedBets);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error listening to lottery bets:", error);
    throw error;
  }
};

export const fetchWinningBets = (userId, gameType, onUpdate, onError) => {
  try {
    const db = getFirestore();
    const gameBetsRef = collection(db, "gameBets");

    const settledBetsQuery = query(
      gameBetsRef,
      where("settled", "==", true),
      where("userID", "==", userId),
      where("gameType", "==", gameType)
    );

    const unsubscribe = onSnapshot(
      settledBetsQuery,
      (snapshot) => {
        const winningBets = [];

        snapshot.forEach((betDoc) => {
          const betData = betDoc.data();
          if (betData.rewardAmount > 0) {
            winningBets.push({
              gameType: betData.gameType,
              winningNumber: betData.winningNumber,
              winningColor: betData.winningColor,
              rewardAmount: betData.rewardAmount,
              timestamp: betData.timestamp,
            });
          }
        });

        // Parse and sort the winning bets in descending order by timestamp
        const sortedWinningBets = winningBets.sort((a, b) => {
          const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
          const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
          return dateB - dateA;
        });

        onUpdate(sortedWinningBets);
      },
      (error) => {
        console.error("Error fetching winning bets: ", error);
        onError(error);
      }
    );

    return unsubscribe; // Return unsubscribe function to stop listening
  } catch (error) {
    console.error("Error setting up listener: ", error);
    throw error;
  }
};
// Fetch all lottery bets
export const fetchAllLotteryBetsHome = async (userId) => {
  try {
    const db = getFirestore();
    const q = query(
      collection(db, "gameBets"),
      where("userID", "==", userId),
      where("settled", "==", true)
    );
    const betsSnapshot = await getDocs(q);
    const bets = betsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Parse and sort the bets in descending order by timestamp
    const sortedBets = bets.sort((a, b) => {
      const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      return dateB - dateA;
    });

    return sortedBets;
  } catch (error) {
    console.error("Error fetching user bets: ", error);
    throw error;
  }
};

// Fetch all lottery bets
export const fetchAllLotteryBets = (userId, gameType, onUpdate) => {
  try {
    const db = getFirestore();
    const betsQuery = query(
      collection(db, "gameBets"),
      where("userID", "==", userId),
      where("settled", "==", true),
      where("gameType", "==", gameType)
    );

    const unsubscribe = onSnapshot(betsQuery, (betsSnapshot) => {
      const bets = betsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedBets = bets.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });
      onUpdate(sortedBets);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error listening to lottery bets:", error);
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
          const reward = bet.betAmount * 8;
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
          const reward = bet.betAmount * 8;
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

// Fetch all transactions (Statements) of the user
export const fetchUserStatement = async (userId) => {
  try {
    const transactionsCollectionRef = collection(db, "transactions");
    const withdrawalsCollectionRef = collection(db, "withdrawals");
    const betsCollectionRef = collection(db, "sportsBets");
    const gameBetsCollectionRef = collection(db, "gameBets");

    const transactionsSnapshot = await getDocs(
      query(
        transactionsCollectionRef,
        where("userId", "==", userId),
        where("status", "==", "approved")
      )
    );
    const withdrawalsSnapshot = await getDocs(
      query(
        withdrawalsCollectionRef,
        where("userId", "==", userId),
        where("status", "==", "approved")
      )
    );
    const betsSnapshot = await getDocs(
      query(betsCollectionRef, where("userId", "==", userId))
    );
    const gameBetsSnapshot = await getDocs(
      query(gameBetsCollectionRef, where("userID", "==", userId))
    );

    const transactionsData = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "Deposit",
      amount: parseFloat(doc.data().amount),
      status: doc.data().status,
      timestamp: doc.data().timestamp,
      userId: doc.data().userId,
    }));

    const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "Withdrawal",
      amount: parseFloat(doc.data().amount),
      status: doc.data().status,
      timestamp: doc.data().timestamp,
      userId: doc.data().userId,
    }));

    const betsData = betsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "Bet",
      amount: parseFloat(doc.data().betAmount),
      rewardAmount: parseFloat(doc.data().possibleWin) || 0,
      status: doc.data().settled ? "settled" : "unsettled",
      timestamp: doc.data().timestamp,
      userId: doc.data().userId,
    }));

    const gameBetsData = gameBetsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "Game Bet",
      amount: parseFloat(doc.data().betAmount),
      rewardAmount: parseFloat(doc.data().rewardAmount) || 0,
      status: doc.data().settled ? "settled" : "unsettled",
      timestamp: doc.data().timestamp,
      userId: doc.data().userID,
    }));

    const combinedData = [
      ...transactionsData,
      ...withdrawalsData,
      ...betsData,
      ...gameBetsData,
    ];

    // Sort combinedData by timestamp
    combinedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Calculate balance for each transaction
    let balance = 0;
    const combinedDataWithBalance = combinedData.map((entry) => {
      if (entry.type === "Deposit") {
        balance += entry.amount;
      } else if (
        entry.type === "Withdrawal" ||
        entry.type === "Bet" ||
        entry.type === "Game Bet"
      ) {
        balance -= entry.amount;
      }
      if (entry.rewardAmount) {
        balance += entry.rewardAmount;
      }
      return {
        ...entry,
        balance,
      };
    });

    return combinedDataWithBalance;
  } catch (error) {
    console.error("Error fetching balance history: ", error);
    throw error;
  }
};

// Complaints Section

// Submit complaint
export const submitComplaint = async (
  userId,
  game,
  complaintType,
  description
  // status
) => {
  try {
    const complaintsCollectionRef = collection(db, "complaints");
    const complaintData = {
      userId,
      game,
      complaintType,
      description,
      status: "pending",
      adminRemarks: "",
      timestamp: formatTimestamp(),
    };
    const docRef = await addDoc(complaintsCollectionRef, complaintData);
    return docRef.id;
  } catch (error) {
    console.error("Error submitting complaint: ", error);
    throw error;
  }
};

// Fetch user complaints
export const fetchUserComplaints = async (userId) => {
  try {
    const complaintsCollectionRef = collection(db, "complaints");
    const q = query(complaintsCollectionRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const complaintsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return complaintsData;
  } catch (error) {
    console.error("Error fetching user complaints: ", error);
    throw error;
  }
};

// ==================TESTING==================

// Fetch active series match data from Firestore
export const fetchCricketMatches = async () => {
  try {
    // Fetch cricketData collection
    const matchDataCollection = collection(db, "cricketData");
    const cricketDataQuery = query(
      matchDataCollection,
      where("active", "==", true)
    );
    const matchDataSnapshot = await getDocs(cricketDataQuery);
    const cricketMatches = matchDataSnapshot.docs.flatMap((doc) => {
      const matches = doc.data().matches;
      return matches.map((match) => ({
        ...match,
        t1: match.t1.replace(/\s*\[.*?\]/, ""), // Clean t1
        t2: match.t2.replace(/\s*\[.*?\]/, ""), // Clean t2
      }));
    });

    // Fetch oddsCricket collection
    const oddsCricketCollection = collection(db, "oddsCricket");
    const oddsCricketSnapshot = await getDocs(oddsCricketCollection);
    const oddsMatches = oddsCricketSnapshot.docs.map((doc) => doc.data());

    // Combine cricket matches with odds data
    const cricketMatchesWithOdds = cricketMatches.map((cricketMatch) => {
      const matchingOdds = oddsMatches.find((oddsMatch) => {
        const isSameMatch =
          (cricketMatch.t1 === oddsMatch.away_team &&
            cricketMatch.t2 === oddsMatch.home_team) ||
          (cricketMatch.t1 === oddsMatch.home_team &&
            cricketMatch.t2 === oddsMatch.away_team);

        return isSameMatch;
      });

      // If a matching odds entry is found, include bookmaker data
      if (matchingOdds) {
        const bookmakers = matchingOdds.bookmakers.map((bookmaker) => {
          const h2hMarket = bookmaker.markets.find(
            (market) => market.key === "h2h"
          );
          return {
            title: bookmaker.title,
            outcomes: h2hMarket ? h2hMarket.outcomes : [],
          };
        });

        return {
          ...cricketMatch,
          bookmakers,
        };
      }

      // If no matching odds entry, return match without bookmaker data
      return {
        ...cricketMatch,
        bookmakers: [],
      };
    });

    return cricketMatchesWithOdds;
  } catch (error) {
    console.error("Error fetching match data: ", error);
    throw error;
  }
};

// ==================TESTING==================

// Fetch marqueeText

export const fetchMarqueeText = async () => {
  try {
    const marqueeTextRef = doc(db, "adminDataUpdates", "marqueeText");
    const marqueeDoc = await getDoc(marqueeTextRef);
    if (marqueeDoc.exists) {
      return marqueeDoc.data().marqueeText;
    } else {
      return "Welcome! Please check out our latest updates";
    }
  } catch (e) {
    console.log(e);
  }
};
// Fetch Offer Percentage

export const fetchOfferData = async () => {
  try {
    const offerDataRef = doc(db, "adminDataUpdates", "offerPercentage");
    const offerDataDoc = await getDoc(offerDataRef);
    if (offerDataDoc.exists) {
      return offerDataDoc.data().offerPercentage;
    } else {
      return "10";
    }
  } catch (e) {
    console.log(e);
  }
};
// Fetch WhatsApp Number

export const fetchWhatsappNumber = async () => {
  try {
    const whatsappNumberRef = doc(db, "adminDataUpdates", "whatsappNumber");
    const whatsappNumberDoc = await getDoc(whatsappNumberRef);
    if (whatsappNumberDoc.exists) {
      return whatsappNumberDoc.data().whatsappNumber;
    } else {
      return "There is no WhatsApp number! Please try another method";
    }
  } catch (e) {
    console.log(e);
  }
};

// Fetch UPI ID
export const fetchUpiID = async () => {
  try {
    const upiIDRef = doc(db, "upiID", "upiID");
    const upiIDDoc = await getDoc(upiIDRef);
    if (upiIDDoc.exists) {
      return upiIDDoc.data().upiID;
    } else {
      return "There is no upiID! Please try another method";
    }
  } catch (e) {
    console.log(e);
  }
};

// Aviator section

// Function to fetch the current game state in real-time using onSnapshot
export const fetchAviatorGameState = (callback) => {
  try {
    const gameStateRef = doc(db, "aviatorGameState", "currentState");

    const unsubscribe = onSnapshot(gameStateRef, (gameStateDoc) => {
      if (gameStateDoc.exists()) {
        const gameStateData = gameStateDoc.data();
        callback(gameStateData.state);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching game state in real-time: ", error);
    throw error;
  }
};
// Function to fetch the crash point limits (min and max) from currentCrashLimit in Firestore in real-time
export const subscribeToCrashLimits = (callback) => {
  try {
    const currentCrashLimitRef = doc(
      db,
      "aviatorSettings",
      "currentCrashLimit"
    );

    return onSnapshot(currentCrashLimitRef, (currentCrashLimitDoc) => {
      if (currentCrashLimitDoc.exists()) {
        callback(currentCrashLimitDoc.data());
      } else {
        console.error("Current crash limits not found");
        callback(null);
      }
    });
  } catch (error) {
    console.error("Error fetching current crash limits: ", error);
    throw error;
  }
};

// Function to create new bet data in Firestore
export const createAviatorUserBet = async (
  userId,
  betAmount,
  betNumber,
  status
) => {
  try {
    const betData = {
      userId,
      betAmount,
      betNumber,
      status,
      timestamp: formatTimestamp(),
    };

    const betsCollectionRef = collection(db, "aviatorUserBets");

    await addDoc(betsCollectionRef, betData);

    console.log("Bet data successfully stored!");
  } catch (error) {
    console.error("Error storing bet data: ", error);
    throw error;
  }
};
// Function to update cancel aviator user bets
export const cancelAviatorUserBet = async (userId, betNumber) => {
  try {
    const betsCollectionRef = collection(db, "aviatorUserBets");
    const q = query(
      betsCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "pending"),
      where("betNumber", "==", betNumber)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        status: "cancelled",
      });
    });
  } catch (error) {
    console.error("Error cancelling user bets: ", error);
    throw error;
  }
};
// Function to update aviatro user bets on cashout
export const updateAviatorBetsOnCashout = async (
  userId,
  winningMultiplier,
  cashoutAmount,
  betNumber
) => {
  try {
    const betsCollectionRef = collection(db, "aviatorUserBets");
    const q = query(
      betsCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "pending"),
      where("betNumber", "==", betNumber)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        status: "cashout",
        winningMultiplier: winningMultiplier,
        cashoutAmount: cashoutAmount,
      });
    });
  } catch (error) {
    console.error("Error updating user bets on cashout: ", error);
    throw error;
  }
};

// Function to update aviator user bets on crash
export const updateAviatorBetsOnCrash = async (userId, crashMultiplier) => {
  try {
    const betsCollectionRef = collection(db, "aviatorUserBets");
    const q = query(
      betsCollectionRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const betData = doc.data();
      if (betData.status === "pending") {
        await updateDoc(doc.ref, {
          status: "crashed",
          crashMultiplier: crashMultiplier,
        });
      }
    });
  } catch (error) {
    console.error("Error updating user bets on crash: ", error);
    throw error;
  }
};
