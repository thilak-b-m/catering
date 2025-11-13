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

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    message.textContent = `✅ Account created successfully for ${userCredential.user.email}!`;

    // Redirect to login page after a short delay
     setTimeout(() => {
    // Get the current page file name
    const currentPage = window.location.pathname.split("/").pop();

    // Conditional redirect
    if (currentPage === "create.html") {
      window.location.href = "user_detail.html";
    } else {
      window.location.href = "caterer_detail.html";
    }
  }, 1000);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      message.textContent = "⚠️ Email already exists. Please sign in instead.";
    } else {
      message.textContent = `❌ Error: ${error.message}`;
    }
    console.error(error);
  }
});
