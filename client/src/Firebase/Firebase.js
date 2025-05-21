// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDN8uuBsnFLrViSENVxXe1skx9t5chyh8Y",
  authDomain: "mitti-arts-11.firebaseapp.com",
  projectId: "mitti-arts-11",
  storageBucket: "mitti-arts-11.firebasestorage.app",
  messagingSenderId: "80807182730",
  appId: "1:80807182730:web:d83dc8f12309933189c873",
  measurementId: "G-GDW9W4DDZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
