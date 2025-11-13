// auth.js
import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const message = document.getElementById('message');
const signupBtn = document.getElementById('signup');


// --- SIGN UP ---
signupBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "❌ Please enter both email and password.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    message.textContent = `✅ Account created successfully! Welcome ${userCredential.user.email}`;
  } catch (error) {
    message.textContent = `❌ Error: ${error.code} - ${error.message}`;
    console.error(error);
  }
});

// --- LOGIN ---
loginBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "❌ Please enter both email and password.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    message.textContent = `✅ Logged in successfully! Welcome ${userCredential.user.email}`;

    // Redirect to user_detail.html after login
    setTimeout(() => {
      window.location.href = "user_detail.html";
    }, 1000);
  } catch (error) {
    message.textContent = `❌ Error: ${error.code} - ${error.message}`;
    console.error(error);
  }
});
