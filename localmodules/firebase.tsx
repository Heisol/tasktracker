// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxJL1Z5o9qNryRClchNvsX-yVEk2A_gtw",
  authDomain: "tasktracker-d1d48.firebaseapp.com",
  projectId: "tasktracker-d1d48",
  storageBucket: "tasktracker-d1d48.appspot.com",
  messagingSenderId: "259293364929",
  appId: "1:259293364929:web:9d1c68632779823c71ca40"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
