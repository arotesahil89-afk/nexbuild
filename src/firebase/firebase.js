// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUiW1PbP1jrAG68qSLrzU_TDKklOHSHdY",
  authDomain: "mumbaicharajawebsite.firebaseapp.com",
  projectId: "mumbaicharajawebsite",
  storageBucket: "mumbaicharajawebsite.firebasestorage.app",
  messagingSenderId: "1087798763150",
  appId: "1:1087798763150:web:e64e9ac10f6159528a73df",
  measurementId: "G-E1E1C9V749"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
