import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDli6R1N98VxK89r788yPyBne-839LVFys",
  authDomain: "teliernews-f730a.firebaseapp.com",
  projectId: "teliernews-f730a",
  storageBucket: "teliernews-f730a.firebasestorage.app",
  messagingSenderId: "339087493380",
  appId: "1:339087493380:web:7852e353adfbb1fe936851",
  measurementId: "G-1P7S89VCGK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
