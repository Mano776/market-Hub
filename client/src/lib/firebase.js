import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4sSbRxROmQ6ocLLVQuEX0csBO2POBBr8",
  authDomain: "markethub-65232.firebaseapp.com",
  projectId: "markethub-65232",
  storageBucket: "markethub-65232.firebasestorage.app",
  messagingSenderId: "1064250902424",
  appId: "1:1064250902424:web:27d8fe4c1a701cdf3c4ded",
  measurementId: "G-3B99JR7J9V"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services with cross-environment stability
export const auth = getAuth(app);

// Use initializeFirestore with settings for better connectivity in restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
