import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsW3KhUinSuxr4Y3dbIVXWazyC9DeVOiU",
  authDomain: "pantrybloom-a7237.firebaseapp.com",
  projectId: "pantrybloom-a7237",
  storageBucket: "pantrybloom-a7237.firebasestorage.app",
  messagingSenderId: "59696142465",
  appId: "1:59696142465:web:a4477f72294ed2afc05580",
  measurementId: "G-KFJNDWBGM1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
