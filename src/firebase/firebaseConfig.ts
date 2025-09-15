// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJbVPEjEXZfYnknaaIsplSXdAOvA2f8ks",
  authDomain: "charged-app-5510e.firebaseapp.com",
  projectId: "charged-app-5510e",
  storageBucket: "charged-app-5510e.firebasestorage.app",
  messagingSenderId: "620776078902",
  appId: "1:620776078902:web:80bbd57e7cb47522582297",
  measurementId: "G-FYR6RFDNSV"
};

const Firebase = initializeApp(firebaseConfig);
export const auth = getAuth(Firebase);
