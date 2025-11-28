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
    const firebaseUid = userCredential.user.uid;
    message.textContent = `✅ Welcome back, ${userCredential.user.email}!`;

    // Create a hidden form and submit to backend with firebase_uid
    const form = document.createElement('form');
    form.method = 'POST';
    
    // Determine which login endpoint to use based on current page
    if (window.location.pathname.includes("catererlogin")) {
      form.action = '/submit_caterer_login';
    } else {
      form.action = '/submit_user_login';
    }

    // Add firebase_uid as hidden field
    const uidInput = document.createElement('input');
    uidInput.type = 'hidden';
    uidInput.name = 'firebase_uid';
    uidInput.value = firebaseUid;
    form.appendChild(uidInput);

    // Add email as hidden field
    const emailField = document.createElement('input');
    emailField.type = 'hidden';
    emailField.name = 'email';
    emailField.value = email;
    form.appendChild(emailField);

    document.body.appendChild(form);
    
    setTimeout(() => form.submit(), 800);

  } catch (error) {
    if (error.code === "auth/user-not-found") {
      message.textContent = "⚠️ No account found. Redirecting to create account...";
      setTimeout(() => {
        if (window.location.pathname.includes("catererlogin")) {
          window.location.href = "/create_caterer";
        } else {
          window.location.href = "/create";
        }
      }, 1500);
    } else if (error.code === "auth/wrong-password") {
      message.textContent = "❌ Incorrect password. Try again.";
    } else {
      message.textContent = `❌ Error: ${error.message}`;
    }
    console.error(error);
  }
});
