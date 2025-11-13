// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDJfCjXP8F2EY4lsIMU6rKJa4MG8zkg36E",
  authDomain: "catering-management-syst-db0c8.firebaseapp.com",
  projectId: "catering-management-syst-db0c8",
  storageBucket: "catering-management-syst-db0c8.firebasestorage.app",
  messagingSenderId: "624451269923",
  appId: "1:624451269923:web:e3cf9fc78d430c7e2cc896"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
