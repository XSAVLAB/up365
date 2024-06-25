import { db } from "../firebaseConfig";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
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
      timestamp: new Date(),
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
      timestamp: new Date(),
    });
    console.log("Withdrawal request stored in Firestore");
  } catch (error) {
    console.error("Error storing withdrawal request: ", error);
    throw error;
  }
};

// Fetch user wallet by user ID
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
