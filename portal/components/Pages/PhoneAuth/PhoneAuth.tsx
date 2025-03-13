"use client";

import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../../firebase";
import { ConfirmationResult } from "firebase/auth";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { db } from "@/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { createProfile } from "@/api/firestoreService";

const PhoneAuth: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => console.log("Recaptcha verified"),
      });

    }
  };

  const sendOTP = async () => {
    if (!phoneNumber) return alert("Enter phone number");

    setLoading(true);
    setupRecaptcha();

    try {
      const confirmation: ConfirmationResult = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, (window as any).recaptchaVerifier);
      setVerificationId(confirmation.verificationId);
    } catch (error: any) {
      console.error("Error sending OTP", error);
    }
    setLoading(false);
  };

  // const verifyOTP = async () => {
  //   if (!otp) return alert("Enter OTP");
  //   if (!verificationId) return alert("No OTP request found");

  //   setLoading(true);
  //   try {
  //     const credential = PhoneAuthProvider.credential(verificationId, otp);
  //     await signInWithCredential(auth, credential);

  //     alert("Phone verified successfully!");
  //   } catch (error: any) {
  //     console.error("Error verifying OTP", error);
  //     alert(error.message);
  //   }
  //   setLoading(false);
  // };
  const verifyOTP = async () => {
    if (!otp) return alert("Enter OTP");
    if (!verificationId) return alert("No OTP request found");

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const profileData = {
          firstName: "",
          lastName: "",
          phoneNumber: user.phoneNumber,
          email: user.email || "",
          isConsentGiven: false,
          isTermsAccepted: false,

        };
        await createProfile(user.uid, profileData);
      }
      router.push("/");
    } catch (error: any) {
      console.error("Error verifying OTP", error);
    }
    setLoading(false);
  };

  return (

    <div className="login_section__form">
      <div className="mb-5 mb-md-6">
        <input
          type="tel"
          placeholder="Enter mobile number"
          value={phoneNumber}
          onChange={(e) => {
            const input = e.target.value.replace(/\D/g, "");
            if (input.length <= 10) {
              setPhoneNumber(input);
            }
          }}
          className="n11-bg"
          disabled={verificationId !== null}
        />
      </div>

      {!verificationId ? (
        <button onClick={sendOTP} disabled={loading} className="cmn-btn px-5 py-3 mb-6 w-100">
          {loading ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <div className="mb-5 mb-md-6">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="n11-bg"
          />
          <button onClick={verifyOTP} disabled={loading} className="cmn-btn px-5 py-3 mb-6 w-100">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>


  );
};

export default PhoneAuth;
