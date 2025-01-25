// script.js

// Backend URL
const BASE_URL = 'http://localhost:5000/api/auth';

// config for ship now
document.getElementById('shipment-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const pickupAddress = document.getElementById('pickup-address').value;
  const deliveryAddress = document.getElementById('delivery-address').value;
  const weight = document.getElementById('package-weight').value;
  const transitType = document.getElementById('transit-type').value;

  try {
      const response = await fetch('http://localhost:5000/api/packages', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pickupAddress, deliveryAddress, weight, transitType }),
      });

      if (response.ok) {
          alert('Shipment requested successfully.');
      } else {
          alert('Failed to request shipment. Please try again.');
      }
  } catch (err) {
      console.error('Error requesting shipment:', err.message);
  }
});







// functinalities for support page
document.getElementById('contact-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
      const response = await fetch('http://localhost:5000/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
          alert('Message sent successfully.');
      } else {
          alert('Failed to send message. Please try again.');
      }
  } catch (err) {
      console.error('Error sending message:', err.message);
  }
});







// Handle Tracking Form Submission
document.getElementById('track-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const trackingId = document.getElementById('tracking-id').value.trim();

    if (!trackingId) {
        alert('Please enter a valid tracking ID.');
        return;
    }

    try {
        // Fetch tracking details from the backend
        const response = await fetch(`${BASE_URL}/packages/${trackingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            // Update the tracking results section
            document.getElementById('package-id').textContent = data.packageId || 'N/A';
            document.getElementById('status').textContent = data.status || 'N/A';
            document.getElementById('current-location').textContent = data.currentLocation
                ? `${data.currentLocation.latitude}, ${data.currentLocation.longitude}`
                : 'Location not available';
            document.getElementById('estimated-delivery').textContent = data.estimatedDelivery || 'N/A';

            // Show tracking results
            document.getElementById('tracking-results').classList.remove('hidden');
        } else {
            alert(data.message || 'Failed to fetch tracking details.');
        }
    } catch (err) {
        console.error('Error fetching tracking details:', err.message);
        alert('An error occurred. Please try again.');
    }
});
// track end







// profile auth

// Load user profile data
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to access this page.');
        window.location.href = 'login.html';
    }

    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phone;
        } else {
            throw new Error('Failed to fetch profile details');
        }
    } catch (err) {
        console.error('Error loading profile:', err.message);
        alert('An error occurred. Please try again.');
    }
});

// Update profile
document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phone }),
        });

        if (response.ok) {
            alert('Profile updated successfully.');
        } else {
            throw new Error('Failed to update profile.');
        }
    } catch (err) {
        console.error('Error updating profile:', err.message);
        alert('An error occurred. Please try again.');
    }
});

// Change password
document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match.');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/profile/password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (response.ok) {
            alert('Password updated successfully.');
        } else {
            throw new Error('Failed to update password.');
        }
    } catch (err) {
        console.error('Error updating password:', err.message);
        alert('An error occurred. Please try again.');
    }
});


// profile end









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


// end auth




// loader
// show loader
function showLoader() {
  document.querySelector('.loader').style.display = 'block';
}
// hide loader
function hideLoader() {
  document.querySelector('.loader').style.display = 'none';
}

// end loader


// signup form 
// Handle Signup Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch(`${BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
          alert('Registration successful! Redirecting to login.');
          window.location.href = 'login.html';
      } else {
          alert(data.message || 'Failed to register. Please try again.');
      }
  } catch (err) {
      console.error('Error during registration:', err.message);
      alert('An error occurred. Please try again later.');
  }
});





// admin registeration form
// Handle Admin Registration
document.getElementById('admin-register-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
      alert('You are not authorized to perform this action.');
      return;
  }

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  try {
      const response = await fetch(`${BASE_URL}/admin/create-admin`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (response.ok) {
          alert('Admin account created successfully.');
      } else {
          alert(data.message || 'Failed to create admin account.');
      }
  } catch (err) {
      console.error('Error creating admin:', err.message);
      alert('An error occurred. Please try again later.');
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



// functionality to manage-user
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
      alert('Unauthorized access');
      window.location.href = 'unauthorized.html';
  }

  const usersTableBody = document.querySelector('#users-table tbody');

  // Fetch users
  try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
      });
      const users = await response.json();

      if (response.ok) {
          users.forEach((user) => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${user._id}</td>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td>${user.phone}</td>
                  <td>${user.role}</td>
                  <td>
                      <button onclick="promoteUser('${user._id}')">Promote</button>
                      <button onclick="deleteUser('${user._id}')">Delete</button>
                  </td>
              `;
              usersTableBody.appendChild(row);
          });
      } else {
          alert(users.message || 'Failed to fetch users.');
      }
  } catch (err) {
      console.error('Error fetching users:', err.message);
  }
});

async function promoteUser(userId) {
  const token = localStorage.getItem('token');
  if (!confirm('Are you sure you want to promote this user to Admin?')) return;

  try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'Admin' }),
      });

      if (response.ok) {
          alert('User promoted successfully.');
          location.reload();
      } else {
          alert('Failed to promote user.');
      }
  } catch (err) {
      console.error('Error promoting user:', err.message);
  }
}

async function deleteUser(userId) {
  const token = localStorage.getItem('token');
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
          alert('User deleted successfully.');
          location.reload();
      } else {
          alert('Failed to delete user.');
      }
  } catch (err) {
      console.error('Error deleting user:', err.message);
  }
}



// manage package functionality
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const packagesTableBody = document.querySelector('#packages-table tbody');

  try {
      const response = await fetch('http://localhost:5000/api/admin/packages', {
          headers: { Authorization: `Bearer ${token}` },
      });
      const packages = await response.json();

      if (response.ok) {
          packages.forEach((pkg) => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${pkg.packageId}</td>
                  <td>${pkg.userId}</td>
                  <td>${pkg.status}</td>
                  <td>${pkg.transitType}</td>
                  <td>${pkg.deliveryType}</td>
                  <td>
                      <button onclick="updateStatus('${pkg.packageId}')">Update Status</button>
                      <button onclick="deletePackage('${pkg.packageId}')">Delete</button>
                  </td>
              `;
              packagesTableBody.appendChild(row);
          });
      } else {
          alert(packages.message || 'Failed to fetch packages.');
      }
  } catch (err) {
      console.error('Error fetching packages:', err.message);
  }
});

async function updateStatus(packageId) {
  const token = localStorage.getItem('token');
  const status = prompt('Enter new status (Pending, In Transit, Delivered):');
  if (!status) return;

  try {
      const response = await fetch(`http://localhost:5000/api/admin/packages/${packageId}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
      });

      if (response.ok) {
          alert('Package status updated successfully.');
          location.reload();
      } else {
          alert('Failed to update package status.');
      }
  } catch (err) {
      console.error('Error updating status:', err.message);
  }
}




// functionality for managing driver
async function addDriver() {
  const name = prompt('Enter driver name:');
  const email = prompt('Enter driver email:');
  const phone = prompt('Enter driver phone:');
  if (!name || !email || !phone) return;

  const token = localStorage.getItem('token');
  try {
      const response = await fetch('http://localhost:5000/api/admin/drivers', {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, phone }),
      });

      if (response.ok) {
          alert('Driver added successfully.');
          location.reload();
      } else {
          alert('Failed to add driver.');
      }
  } catch (err) {
      console.error('Error adding driver:', err.message);
  }
}
