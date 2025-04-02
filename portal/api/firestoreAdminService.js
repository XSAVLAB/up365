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
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { max, parse } from "date-fns";
// Time formater:
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

// Fetch all users with real-time updates
export const fetchAllUsers = (callback) => {
  try {
    const usersCollectionRef = collection(db, "users");
    return onSnapshot(usersCollectionRef, (usersSnapshot) => {
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Parse and sort the users in descending order by timestamp
      const sortedUsers = usersData.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });

      callback(sortedUsers);
    });
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

// Fetch all transactions with real-time updates
export const fetchTransactions = (callback) => {
  try {
    const transactionsCollectionRef = collection(db, "transactions");
    return onSnapshot(transactionsCollectionRef, (transactionsSnapshot) => {
      const transactionsData = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedTransactions = transactionsData.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });

      callback(sortedTransactions);
    });
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    throw error;
  }
};

//  Update the notification field in the transaction after notifying the admin
export const updateNotificationStatus = async () => {
  try {
    await updateDoc(doc(db, "notifications", "admin"), {
      newRequest: false,
    });
    console.log("Notification status reset.");
  } catch (error) {
    console.error("Error resetting notification status:", error);
  }
};

// Update transaction status
export const updateTransactionStatus = async (
  transactionId,
  status,
  comment
) => {
  try {
    const transactionDocRef = doc(db, "transactions", transactionId);
    await updateDoc(transactionDocRef, { status, comment });
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
// Add a deposit request by admin
export const addDepositRequest = async (userId, amount) => {
  try {
    const transactionCollectionRef = collection(db, "transactions");
    await addDoc(transactionCollectionRef, {
      amount: amount,
      userId,
      timestamp: formatTimestamp(),
      status: "pending",
      byAdmin: true,
    });
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

// Fetch all withdrawals with real-time updates
export const fetchWithdrawals = (callback) => {
  try {
    const withdrawalsCollectionRef = collection(db, "withdrawals");
    return onSnapshot(withdrawalsCollectionRef, (withdrawalsSnapshot) => {
      const withdrawalsData = withdrawalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedWithdrawals = withdrawalsData.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });

      callback(sortedWithdrawals);
    });
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
  status,
  comment
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

    await updateDoc(withdrawalDocRef, { status, comment });
  } catch (error) {
    console.error("Error updating withdrawal status: ", error);
    throw error;
  }
};

// Helper function to get user details by ID
const getUserDetails = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return `${userData.firstName} ${userData.lastName}`;
  }
  return "Unknown User";
};

// Fetch both Approved Transactions and Withdrawals in a single function
export const fetchApprovedData = async () => {
  try {
    const transactionsCollection = collection(db, "transactions");
    const withdrawalsCollection = collection(db, "withdrawals");

    const transactionsQuery = query(
      transactionsCollection,
      where("status", "==", "approved")
    );
    const withdrawalsQuery = query(
      withdrawalsCollection,
      where("status", "==", "approved")
    );

    const [transactionsSnapshot, withdrawalsSnapshot] = await Promise.all([
      getDocs(transactionsQuery),
      getDocs(withdrawalsQuery),
    ]);

    const transactions = await Promise.all(
      transactionsSnapshot.docs.map(async (doc) => {
        const transaction = doc.data();
        const fullName = await getUserDetails(transaction.userId);
        return {
          id: doc.id,
          fullName,
          userId: transaction.userId,
          amount: transaction.amount,
          status: transaction.status,
          timestamp: transaction.timestamp,
          type: "deposit",
        };
      })
    );

    const withdrawals = await Promise.all(
      withdrawalsSnapshot.docs.map(async (doc) => {
        const withdrawal = doc.data();
        const fullName = await getUserDetails(withdrawal.userId);
        return {
          id: doc.id,
          fullName,
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          status: withdrawal.status,
          timestamp: withdrawal.timestamp,
          type: "withdrawal",
        };
      })
    );

    // Merge and sort data based on timestamp
    const mergedData = [...transactions, ...withdrawals].sort((a, b) => {
      const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
      return dateB - dateA; // Sort in descending order
    });

    return mergedData;
  } catch (error) {
    console.error("Error fetching approved data: ", error);
    throw error;
  }
};

// Fetch series data with real-time updates
export const fetchSeries = (callback) => {
  try {
    const seriesCollectionRef = collection(db, "cricketData");
    return onSnapshot(seriesCollectionRef, (seriesSnapshot) => {
      const seriesData = seriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(seriesData);
    });
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

// Fetch all complaints with real-time updates
export const fetchComplaints = (callback) => {
  try {
    const complaintsCollection = collection(db, "complaints");
    return onSnapshot(complaintsCollection, (complaintsSnapshot) => {
      const complaintsList = complaintsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sortedcomplaintsList = complaintsList.sort((a, b) => {
        const dateA = parse(a.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        const dateB = parse(b.timestamp, "d/M/yyyy, h:mm:ss a", new Date());
        return dateB - dateA;
      });
      callback(sortedcomplaintsList);
    });
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
    const marqueeTextRef = doc(db, "adminDataUpdates", "marqueeText");
    await updateDoc(marqueeTextRef, { marqueeText: marqueeText });
  } catch (error) {
    console.error("Error updating the marquee", error);
  }
};
// Function to update Offers in Firestore
export const updateOfferPercentage = async (offerPercentage) => {
  try {
    const offerPercentageRef = doc(db, "adminDataUpdates", "offerPercentage");
    await updateDoc(offerPercentageRef, { offerPercentage: offerPercentage });
  } catch (error) {
    console.error("Error updating the offer", error);
  }
};
// Function to update Whatsapp Number in Firestore
export const updateWhatsappNumber = async (whatsappNumber) => {
  try {
    const whatsappNumberRef = doc(db, "adminDataUpdates", "whatsappNumber");
    await updateDoc(whatsappNumberRef, { whatsappNumber: whatsappNumber });
  } catch (error) {
    console.error("Error updating the Whatsapp Number", error);
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

export const updateBankDetails = async (bankName, accountNumber, ifscCode) => {
  try {
    const bankDetailsRef = doc(db, "bankDetails", "bankDetails");
    await updateDoc(bankDetailsRef, { bankName, accountNumber, ifscCode });
  } catch (error) {
    console.error("Error updating bank details:", error);
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

// Aviator Game functions

// Function to update the crash point limits (min and max) for all user groups in Firestore
export const setCrashLimits = async (limits) => {
  const {
    minCrashZero,
    maxCrashZero,
    minCrashOneTwo,
    maxCrashOneTwo,
    minCrashThreePlus,
    maxCrashThreePlus,
  } = limits;

  try {
    const crashLimitsRef = doc(db, "aviatorSettings", "crashLimits");
    await setDoc(crashLimitsRef, {
      minCrashZero,
      maxCrashZero,
      minCrashOneTwo,
      maxCrashOneTwo,
      minCrashThreePlus,
      maxCrashThreePlus,
    });
    console.log("Crash limits updated successfully");
  } catch (error) {
    console.error("Error updating crash limits: ", error);
    throw error;
  }
};

// Function to fetch the crash point limits (min and max) from Firestore in real-time
export const subscribeToCrashLimits = (callback) => {
  try {
    const crashLimitsRef = doc(db, "aviatorSettings", "crashLimits");
    return onSnapshot(crashLimitsRef, (crashLimitsDoc) => {
      if (crashLimitsDoc.exists()) {
        callback(crashLimitsDoc.data());
      } else {
        console.error("Crash limits not found");
        callback(null);
      }
    });
  } catch (error) {
    console.error("Error fetching crash limits: ", error);
    throw error;
  }
};

// Fetch user counts and total bet amount for Aviator game
export const fetchCurrentAviatorUsers = (onChangeCallback, onErrorCallback) => {
  const aviatorBetRoundsRef = collection(db, "aviatorBetRounds");

  const q = query(aviatorBetRoundsRef, where("isCompleted", "==", false));

  return onSnapshot(
    q,
    (snapshot) => {
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          onChangeCallback(data);
        }
      });
    },
    (error) => {
      onErrorCallback(error);
    }
  );
};

// Set the current crash limits to 0 for crashing the plane
export const crashAviatorPlane = async () => {
  try {
    const gameStateRef = doc(db, "aviatorGameState", "currentState");
    const gameStateSnap = await getDoc(gameStateRef);

    if (gameStateSnap.exists() && gameStateSnap.data().state === "flying") {
      await updateDoc(gameStateRef, { state: "crashed" });
    } else {
      console.log("Plane is not currently flying; no action taken.");
    }
  } catch (error) {
    console.error("Error crashing the plane: ", error);
    throw error;
  }
};

/**
 * Fetches all unsettled cricket bets from Firestore.
 */
export const fetchUnsettledCricketBets = async () => {
  try {
    const cricketBetsRef = collection(db, "cricketBets");
    const q = query(cricketBetsRef, where("settled", "==", false));
    const querySnapshot = await getDocs(q);

    const bets = [];
    querySnapshot.forEach((doc) => {
      bets.push({ id: doc.id, ...doc.data() });
    });

    return bets;
  } catch (error) {
    console.error("Error fetching unsettled cricket bets:", error);
    return [];
  }
};