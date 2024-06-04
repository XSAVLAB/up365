import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

// Fetch all users
export const fetchAllUsers = async () => {
  try {
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id, // Include the document ID
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
