import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMpAQ4tMp9Ja5agiaEcIyXDJkF1GUJ5jU",
  authDomain: "sabor-global-1c79e.firebaseapp.com",
  projectId: "sabor-global-1c79e",
  storageBucket: "sabor-global-1c79e.firebasestorage.app",
  messagingSenderId: "36612839950",
  appId: "1:36612839950:web:d5660f3f9b94be2123ba5f"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export default app;
