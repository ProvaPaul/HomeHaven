// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "homehaven-9e320.firebaseapp.com",
  projectId: "homehaven-9e320",
  storageBucket: "homehaven-9e320.appspot.com",
  messagingSenderId: "571552007191",
  appId: "1:571552007191:web:821a2a6f29ce6a903d4852"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);