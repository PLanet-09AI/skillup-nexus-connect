
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjWwzFpdk3bvK6WGnUhUAzUYXMFLCkbWo",
  authDomain: "skillupconnect-f6fd3.firebaseapp.com",
  projectId: "skillupconnect-f6fd3",
  storageBucket: "skillupconnect-f6fd3.firebasestorage.app",
  messagingSenderId: "33460546477",
  appId: "1:33460546477:web:4968051013b12f71f58f24",
  measurementId: "G-CEEM0TS85M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
