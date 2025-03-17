"use client";

import { useEffect, useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../../../firebase";
import { ConfirmationResult } from "firebase/auth";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { db } from "@/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { createProfile } from "@/api/firestoreService";

interface PhoneAuthProps {
  firstName?: string;
  lastName?: string;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ firstName, lastName }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30); 
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);


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

    setSending(true);
    setupRecaptcha();

    try {
      const confirmation: ConfirmationResult = await signInWithPhoneNumber(auth, `+91${phoneNumber}`, (window as any).recaptchaVerifier);
      setVerificationId(confirmation.verificationId);
      setResendTimer(30);
      setCanResend(false);
    } catch (error: any) {
      console.error("Error sending OTP", error);
    }
    setSending(false);
  };

  const verifyOTP = async () => {
    if (!otp) return alert("Enter OTP");
    if (!verificationId) return alert("No OTP request found");

    setVerifying(true);
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
      setMessage("Invalid OTP!");
    }
    setVerifying(false);
  };

  return (

    <div className="login_section__form">
      {message && <div className="alert alert-danger">{message}</div>}
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
        <button onClick={sendOTP} disabled={sending} className="cmn-btn px-5 py-3 mb-6 w-100">
          {sending ? "Sending..." : "Get OTP"}
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
          <button onClick={verifyOTP} disabled={verifying} className="cmn-btn px-5 py-3 mb-6 w-100">
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            onClick={sendOTP}
            disabled={!canResend}
            className="g1-color"
          >
            {canResend ? "Resend OTP" : `Resend OTP in ${resendTimer}s`}
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>


  );
};

export default PhoneAuth;
