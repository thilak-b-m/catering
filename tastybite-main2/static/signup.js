// signup.js
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup');
const message = document.getElementById('message');

signupBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "❌ Please enter both email and password.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "❌ Password must be at least 6 characters.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUid = userCredential.user.uid;
    message.textContent = `✅ Account created successfully for ${userCredential.user.email}!`;

    // Store firebase_uid and email in sessionStorage for the detail form
    sessionStorage.setItem('firebase_uid', firebaseUid);
    sessionStorage.setItem('user_email', email);

    setTimeout(() => {
      const currentPath = window.location.pathname;

      if (currentPath.includes("create_caterer") || currentPath.includes("cat_create")) {
        window.location.href = "/caterer_detail";
      } else {
        window.location.href = "/user_detail";
      }
    }, 1000);

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      message.textContent = "⚠️ Email already exists. Redirecting to login...";

      setTimeout(() => {
        const currentPath = window.location.pathname;

        if (currentPath.includes("create_caterer") || currentPath.includes("cat_create")) {
          window.location.href = "/catererlogin";
        } else {
          window.location.href = "/userlogin";
        }
      }, 1500);
    } else if (error.code === "auth/weak-password") {
      message.textContent = "❌ Password is too weak. Use at least 6 characters.";
    } else if (error.code === "auth/invalid-email") {
      message.textContent = "❌ Invalid email address.";
    } else {
      message.textContent = `❌ Error: ${error.message}`;
    }
    console.error(error);
  }
});
