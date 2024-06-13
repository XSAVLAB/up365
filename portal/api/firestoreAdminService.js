import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return usersData;
  } catch (error) {
    console.error("Error fetching all users: ", error);
    throw error;
  }
};

// Delete user by ID
export const deleteUser = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

// Update user details
export const updateUserDetails = async (userId, updatedData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, updatedData, { merge: true });
  } catch (error) {
    console.error("Error updating user details: ", error);
    throw error;
  }
};

// Fetch user role by user ID
export const fetchUserRole = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || null;
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
};

// Fetch all transactions
export const fetchTransactions = async () => {
  try {
    const transactionsCollectionRef = collection(db, "transactions");
    const transactionsSnapshot = await getDocs(transactionsCollectionRef);
    const transactionsData = transactionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return transactionsData;
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};

// Update transaction status
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const transactionDocRef = doc(db, "transactions", transactionId);
    await updateDoc(transactionDocRef, { status });
  } catch (error) {
    console.error("Error updating transaction status: ", error);
    throw error;
  }
};

// Update user wallet
export const updateUserWallet = async (userId, amount) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const currentWallet = parseFloat(userDoc.data().wallet || "0");
      const newWallet = (currentWallet + parseFloat(amount)).toString();
      await updateDoc(userDocRef, { wallet: newWallet });
    } else {
      throw new Error(`User document with ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error("Error updating user wallet: ", error);
    throw error;
  }
};

// Fetch all withdrawals
export const fetchWithdrawals = async () => {
  try {
    const withdrawalsCollectionRef = collection(db, "withdrawals");
    const withdrawalsSnapshot = await getDocs(withdrawalsCollectionRef);
    const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return withdrawalsData;
  } catch (error) {
    console.error("Error fetching withdrawals: ", error);
    throw error;
  }
};

// Update withdrawal status and user wallet
export const updateWithdrawalStatus = async (
  withdrawalId,
  userId,
  amount,
  status
) => {
  try {
    const withdrawalDocRef = doc(db, "withdrawals", withdrawalId);
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error(`User document with ID ${userId} does not exist.`);
    }

    const currentWallet = parseFloat(userDoc.data().wallet || "0");
    const withdrawalAmount = parseFloat(amount);

    if (status === "approved" && currentWallet >= withdrawalAmount) {
      const newWallet = (currentWallet - withdrawalAmount).toString();
      await updateDoc(userDocRef, { wallet: newWallet });
    } else if (status === "approved") {
      throw new Error(`Insufficient balance in the user's wallet.`);
    }

    await updateDoc(withdrawalDocRef, { status });
  } catch (error) {
    console.error("Error updating withdrawal status: ", error);
    throw error;
  }
};

// Fetch Approved Transactions
export const fetchApprovedTransactions = async () => {
  const transactionsCollection = collection(db, "transactions");
  const q = query(transactionsCollection, where("status", "==", "approved"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Fetch Approved Withdrawals
export const fetchApprovedWithdrawals = async () => {
  const withdrawalsCollection = collection(db, "withdrawals");
  const q = query(withdrawalsCollection, where("status", "==", "approved"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Fetch series data
export const fetchSeries = async () => {
  try {
    const seriesCollectionRef = collection(db, "cricketData");
    const seriesSnapshot = await getDocs(seriesCollectionRef);
    const seriesData = seriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return seriesData;
  } catch (error) {
    console.error("Error fetching series data: ", error);
    throw error;
  }
};

// Toggle series active status
export const toggleSeriesActive = async (seriesName, activeStatus) => {
  try {
    const seriesDocRef = doc(db, "cricketData", seriesName);
    await updateDoc(seriesDocRef, { active: activeStatus });
  } catch (error) {
    console.error("Error toggling series active status: ", error);
    throw error;
  }
};
