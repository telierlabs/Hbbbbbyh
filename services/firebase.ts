import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.FB_API,
  authDomain: import.meta.env.FB_AUTH,
  projectId: import.meta.env.FB_PID,
  storageBucket: import.meta.env.FB_STOR,
  messagingSenderId: import.meta.env.FB_SID,
  appId: import.meta.env.FB_AID,
  measurementId: import.meta.env.FB_MID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const getMessagingInstance = async () => {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
};
