import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhxWZi4y_UilQ-G0oIDh72E2J8b6WgovI",
  authDomain: "function-hall-booking-b0db1.firebaseapp.com",
  projectId: "function-hall-booking-b0db1",
  storageBucket: "function-hall-booking-b0db1.firebasestorage.app",
  messagingSenderId: "365825701639",
  appId: "1:365825701639:web:1ca69a418a21a3da25b7a2",
  measurementId: "G-16FMNFN1RH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
