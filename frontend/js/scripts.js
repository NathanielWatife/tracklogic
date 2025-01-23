// script.js

// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
  // =========== DROPDOWN MENU ==============
  const dropdowns = document.querySelectorAll('.dropdown');

  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) { // Mobile devices only
        this.classList.toggle('active');
        e.stopPropagation(); //Prevent event from bubbling up
      }
    });
});


// Close dropdown when clicking outside
document.addEventListener('click', function() {
  if (window.innerWidth <= 768px) {
    dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
  }
});


// ============== IMAGE SLIDER =====================
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('prev');
const nextBtn = document.querySelector('.next');
let currentSlide = 0;
let slideInterval;

// Function to show a specific slide
function showSlide(index) {
  // Remove active class from all slides and dots
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  // Add active class to current slide and dot
  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

// Function to show next slide
function nextSlide() {
  currentSlide++;
  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  showSlide(currentSlide);
}

// Function to show previous slide
function prevSlide() {
  currentSlide--;
  if (currentSlide < 0) {
    currentSlide =slides.length - 1;
  }
  showSlide(currentSlide);
}


}



});

// Backend URL
const BASE_URL = 'http://localhost:5000/api/auth';

// Handle Signup Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent page reload

  // Collect form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  // Prepare request payload
  const payload = { name, email, password };

  try {
    // Send data to backend
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Signup successful! Redirecting to login page.');
      window.location.href = 'login.html'; // Redirect to login
    } else {
      alert(data.message || 'Signup failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('An error occurred. Please try again later.');
  }
});

// Handle Login Form Submission
document.getElementById('login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent page reload

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
  }
});
