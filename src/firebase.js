import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THESE with your actual keys from the Firebase Console!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "pantry-bloom.firebaseapp.com",
  projectId: "pantry-bloom",
  storageBucket: "pantry-bloom.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
