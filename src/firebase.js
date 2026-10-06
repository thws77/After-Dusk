import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEK6s-v0itVSYpx4ZcRBug4DWP-5piJ6k",
  authDomain: "afterdusk-670a5.firebaseapp.com",
  projectId: "afterdusk-670a5",
  storageBucket: "afterdusk-670a5.firebasestorage.app",
  messagingSenderId: "877327842431",
  appId: "1:877327842431:web:acf54c67806585f2fb534a",
  measurementId: "G-SS9MNNTM6E"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);