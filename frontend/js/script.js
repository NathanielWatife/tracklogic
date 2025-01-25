// script.js

// Backend URL
const BASE_URL = 'http://localhost:5000/api/auth';




// Function to check if the user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  // Optionally, verify the token's expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (payload.exp < currentTime) {
      // Token has expired
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error decoding token:', err);
    return false;
  }
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    alert('You must be logged in to access this page.');
    window.location.href = 'login.html'; // Redirect to login page
  }
}

// Call requireAuth() on protected pages
document.addEventListener('DOMContentLoaded', () => {
  const restrictedPages = ['dashboard.html', 'profile.html', 'track.html']; // Add restricted pages
  const currentPage = window.location.pathname.split('/').pop();

  if (restrictedPages.includes(currentPage)) {
    requireAuth();
  }
});








// show loader
function showLoader() {
  document.querySelector('.loader').style.display = 'block';
}
// hide loader
function hideLoader() {
  document.querySelector('.loader').style.display = 'none';
}



document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission
  console.log('Signup form submitted!'); // Debugging
  showLoader();

  // Collect form data safely
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const phoneField = document.getElementById('phone');
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirm-password');

  if (!nameField || !emailField || !phoneField || !passwordField || !confirmPasswordField) {
    console.error('One or more fields are missing in the DOM');
    return;
  }

  const name = nameField.value;
  const email = emailField.value;
  const phone = phoneField.value;
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;

  console.log({ name, email, phone, password, confirmPassword });

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    hideLoader();
    return;
  }

  // Proceed with the signup request
  const payload = { name, email, phone, password };

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Please check your Email to verify your account.');
      alert('Signup successful! Redirecting to login page.');
      window.location.href = 'login.html';
    } else {
      alert(data.message || 'Signup failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('An error occurred. Please try again later.');
  } finally {
    hideLoader();
  }
});






// Handle Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent page reload
  showLoader();

  // Collect form data
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Prepare request payload
  const payload = { email, password };

  try {
    // Send data to backend
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Login successful!');
      localStorage.setItem('token', data.token); // Store JWT token
      window.location.href = 'dashboard.html'; // Redirect to dashboard or home
    } else {
      alert(data.message || 'Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred. Please try again later.');
  } finally {
    hideLoader();
  }
});




// Logout functionality
document.getElementById('logout')?.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('token'); // Remove token from storage
  alert('You have been logged out.');
  window.location.href = 'login.html'; // Redirect to login page
});
