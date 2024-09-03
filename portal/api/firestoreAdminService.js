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
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
// Update Admin Password

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
    const transactionsQuery = query(
      transactionsCollectionRef
      // orderBy("timestamp", "asc")
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
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
    const withdrawalsQuery = query(
      withdrawalsCollectionRef
      // orderBy("timestamp", "asc")
    );
    const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
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
  try {
    const transactionsCollection = collection(db, "transactions");
    const q = query(
      transactionsCollection,
      where("status", "==", "approved")
      // orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching approved transactions: ", error);
    throw error;
  }
};

// Fetch Approved Withdrawals
export const fetchApprovedWithdrawals = async () => {
  try {
    const withdrawalsCollection = collection(db, "withdrawals");
    const q = query(
      withdrawalsCollection,
      where("status", "==", "approved")
      // orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching approved withdrawals: ", error);
    throw error;
  }
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

// Block or unblock user
export const updateUserBlockStatus = async (
  userId,
  blockStatus,
  comment = ""
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      isBlocked: blockStatus,
      blockComment: comment,
    });
  } catch (error) {
    console.error("Error updating user block status: ", error);
    throw error;
  }
};

// Fetch all complaints
export const fetchComplaints = async () => {
  try {
    const complaintsCollection = collection(db, "complaints");
    const complaintsSnapshot = await getDocs(complaintsCollection);
    const complaintsList = complaintsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return complaintsList;
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

// Update complaint status
export const updateComplaintStatus = async (complaintId, status) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, { status });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    throw error;
  }
};

// Update complaint remarks
export const updateComplaintRemark = async (complaintId, adminRemarks) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, { adminRemarks });
  } catch (error) {
    console.error("Error updating complaint remarks:", error);
    throw error;
  }
};

// Function to update marquee text in Firestore
export const updateMarqueeText = async (marqueeText) => {
  try {
    const marqueeTextRef = doc(db, "offersAndMarquee", "marqueeText");
    await updateDoc(marqueeTextRef, { marqueeText: marqueeText });
  } catch (error) {
    console.error("Error updating the marquee", error);
  }
};
// Function to update Offers in Firestore
export const updateOfferPercentage = async (offerPercentage) => {
  try {
    const offerPercentageRef = doc(db, "offersAndMarquee", "offerPercentage");
    await updateDoc(offerPercentageRef, { offerPercentage: offerPercentage });
  } catch (error) {
    console.error("Error updating the offer", error);
  }
};

// Function to update Upi id in Firestore
export const updateUpiID = async (upiID) => {
  try {
    const upiIDRef = doc(db, "upiID", "upiID");
    await updateDoc(upiIDRef, { upiID: upiID });
  } catch (error) {
    console.error("Error updating the upiID", error);
  }
};

// Function to get today's date in the same format as stored timestamps
const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDate = (timestamp) => {
  const [datePart, timePart] = timestamp.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [time, period] = timePart.split(" ");
  let [hours, minutes, seconds] = time.split(":").map(Number);

  // Convert 12-hour format to 24-hour format
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, seconds);
};

// General function to fetch total amounts based on collection and time period
export const fetchTotalAmount = async (collectionName, timePeriod) => {
  try {
    const transactionsCollection = collection(db, collectionName);
    const q = query(transactionsCollection, where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);

    const totalAmount = querySnapshot.docs
      .filter((doc) => {
        const timestamp = doc.data().timestamp;
        const date = parseDate(timestamp);
        const currentDate = new Date();

        if (timePeriod === "day") {
          return (
            date.getDate() === currentDate.getDate() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear()
          );
        } else if (timePeriod === "month") {
          return (
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear()
          );
        } else if (timePeriod === "year") {
          return date.getFullYear() === currentDate.getFullYear();
        } else {
          return false;
        }
      })
      .reduce((acc, doc) => {
        return acc + parseFloat(doc.data().amount);
      }, 0);

    return totalAmount;
  } catch (error) {
    console.error(`Error fetching total amount from ${collectionName}:`, error);
    throw error;
  }
};

// Function to fetch active users in a specific game
export const fetchActiveUsersInGame = async (gameType) => {
  try {
    const betsRef = collection(db, "gameBets");
    const q = query(betsRef, where("gameType", "==", gameType));
    const querySnapshot = await getDocs(q);
    const today = getTodayDate();
    const activeUsers = new Set();
    querySnapshot.forEach((doc) => {
      const { timestamp, userID } = doc.data();
      if (timestamp.startsWith(today)) {
        activeUsers.add(userID);
      }
    });

    return activeUsers;
  } catch (error) {
    console.error("Error fetching active users in game:", error);
    return new Set();
  }
};
