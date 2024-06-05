import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

export const handleChange = (profileData, setProfileData) => (e) => {
  const { name, value } = e.target;
  setProfileData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
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

// Update Profile
export const updateProfile = async (db, userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, profileData, { merge: true });
    console.log("Profile data stored in Firestore");
  } catch (error) {
    console.error("Error updating profile: ", error);
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
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error updating settings: ", error);
    throw error;
  }
};

// Settings management functions:

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

// Transactions
export const addTransaction = async (userId, transactionData) => {
  try {
    const transactionCollectionRef = collection(db, "transactions");
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
