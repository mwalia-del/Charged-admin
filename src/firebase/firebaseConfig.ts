// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAJbVPEjEXZfYnknaaIsplSXdAOvA2f8ks",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "charged-app-5510e.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "charged-app-5510e",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "charged-app-5510e.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "620776078902",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:620776078902:web:80bbd57e7cb47522582297",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-FYR6RFDNSV"
};

const Firebase = initializeApp(firebaseConfig);
export const auth = getAuth(Firebase);
