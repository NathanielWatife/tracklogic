// script.js

// Wait for the DOM to be fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
  // =========== MOBILE NAVIGATION VARIABLES ==============
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const navContainer = document.querySelector('.nav-container');
  const dropdowns = document.querySelectorAll('.dropdown');

  // Handle dropdowns on mobile
  dropdowns.forEach(dropdown => {
    const dropdownToggle = dropdown.querySelector('a.dropdown-toggle');

    if(dropdownToggle) {
      dropdownToggle.addEventListener('click', function(e) {
        if (window,innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('active');
          e.stopPropagation();
        }
      });
    }
  });


  // Toggle mobile menu
mobileNavToggle.addEventListener('click', () => {
  const isOpen = navContainer.classList.contains('active');
  navContainer.classList.toggle('active');
  mobileNavToggle.setAttribute('aria-expanded', !isOpen);
  mobileNavToggle.classList.toggle('active');
  
  // Prevent body scrolling when menu is open
document.body.style.overflow = isOpen ? 'auto' : this.hidden;

});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navContainer.contains(e.target) && !mobileNavToggle.contains(e.target)) {
    navContainer.classList.remove('active');
    mobileNavToggle.classList.remove('active');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = 'auto';

    // Close all dropdowns
    dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
  }
});

// Close mobile menu when window is resized above mobile breakpoint
window .addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navContainer.classList.remove('active');
    mobileNavToggle.classList.remove('active');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = 'auto';

    // Reset all dropdowns
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  }
});

// ============== IMAGE SLIDER =====================
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const slider = document.querySelector('.slider');
let currentSlide = 0;
let slideInterval;
let isHovered = false;

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
    currentSlide = slides.length - 1;
  }
  showSlide(currentSlide);
}

// Start automatic slideshow
function startSlideshow() {
  if (!isHovered) { // Only start if not hovered
  slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  }
}

// Stop automatic slideshow
function stopSlideshow() {
  clearInterval(slideInterval);
}

// Event Listeners for navigation buttons
nextBtn.addEventListener('click', () => {
  stopSlideshow();
  nextSlide();
  startSlideshow();
});

prevBtn.addEventListener('click', () => {
  stopSlideshow();
  prevSlide();
  startSlideshow();
});

// Event listeners for dots
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    stopSlideshow();
    currentSlide = index;
    showSlide(currentSlide);
    // nextSlide();
    startSlideshow();
  });
});

// Hover handlers
slider.addEventListener('mouseenter', () => {
  isHovered = true;
  stopSlideshow();
});

slider.addEventListener('mouseleave', () => {
  isHovered = false;
  startSlideshow();
});

// Start the slideshow initially
startSlideshow();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopSlideshow();
});

});

// ============== TRACKING FUNCTIONALIY ==========









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
