import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firebase";

// Create Account using Email and Password
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign In with Email and Password
export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Signin with Google
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// Sign Out
export const doSignOut = () => {
  return auth.signOut();
};

// Reset Password
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Fetch Sign-In Methods for Email
// export const getSignInMethodsForEmail = async (email) => {
//   return fetchSignInMethodsForEmail(auth, email);
// };
