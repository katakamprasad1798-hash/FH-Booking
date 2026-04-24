import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

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
const db = getFirestore(app);

async function testFirebase() {
  console.log("Testing Firestore connection...");
  try {
    console.log("1. Testing Write...");
    const docRef = await addDoc(collection(db, "test_connection"), {
      test: "data",
      timestamp: new Date()
    });
    console.log("Write success! Doc ID:", docRef.id);
  } catch (e) {
    console.error("Write Error:", e.message);
  }

  try {
    console.log("2. Testing Read...");
    const q = query(collection(db, "bookings"), orderBy("booking_date", "desc"));
    const snapshot = await getDocs(q);
    console.log(`Read success! Found ${snapshot.size} documents.`);
  } catch (e) {
    console.error("Read Error:", e.message);
  }
  
  process.exit(0);
}

testFirebase();
