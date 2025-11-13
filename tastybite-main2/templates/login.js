// login.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signinBtn = document.getElementById('signin');
const message = document.getElementById('message');

signinBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "❌ Please enter both email and password.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    message.textContent = `✅ Welcome back, ${userCredential.user.email}!`;

    // Redirect depending on login page
    if (window.location.pathname.includes("catererlogin.html")) {
      setTimeout(() => window.location.href = "caterer_dashboard.html", 1000);
    } else {
      setTimeout(() => window.location.href = "user_dashboard.html", 1000);
    }

  } catch (error) {
    if (error.code === "auth/user-not-found") {
      message.textContent = "⚠️ No account found. Redirecting to create account...";
      setTimeout(() => window.location.href = "create.html", 1500);
    } else if (error.code === "auth/wrong-password") {
      message.textContent = "❌ Incorrect password. Try again.";
    } else {
      message.textContent = `❌ Error: ${error.message}`;
    }
    console.error(error);
  }
});
