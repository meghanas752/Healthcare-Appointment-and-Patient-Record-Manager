// src/web/public/js/staff-schedule.js

document.addEventListener('DOMContentLoaded', () => {
  
  // --- AUTH GUARD (Checks for STAFF or ADMIN) ---
  const userString = localStorage.getItem('user');
  let loggedInUser = null;
  
  if (!userString) {
    alert('You must be logged in to view this page.');
    window.location.href = '/login1.html'; // Go back to login
    return;
  }

  try {
    loggedInUser = JSON.parse(userString);
  } catch (e) {
    alert('Invalid session. Please log in again.');
    window.location.href = '/login1.html';
    return;
  }
  
  // **This is the main change: We check for 'STAFF' or 'ADMIN'**
  // (Your 'meghana g' user from the screenshot might be an 'ADMIN' or 'STAFF' role)
  if (loggedInUser.role !== 'STAFF' && loggedInUser.role !== 'ADMIN') {
    alert('Access denied. This page is for Staff and Administrators only.');
    window.location.href = '/login1.html'; 
    return;
  }

  // Update the sidebar with the logged-in staff's name
  const staffNameEl = document.getElementById('staff-name-display');
  if (staffNameEl) {
    staffNameEl.textContent = loggedInUser.username;
  }
  // --- END OF AUTH GUARD ---

  
  // --- LOGOUT BUTTON (with improved styling) ---
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault(); 
      localStorage.removeItem('user');
      alert('You have been logged out.');
      window.location.href = '/login1.html';
    });
  }
  
  // --- NEW: Search button listener ---
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('doctor-name-input');
  
  searchButton.addEventListener('click', () => {
    const doctorName = searchInput.value.trim();
    if (doctorName) {
      fetchAppointments(doctorName);
    } else {
      alert('Please enter a doctor name.');
    }
  });
  
  // Allow pressing "Enter" to search
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });
});


/**
 * Fetches appointments for the given doctor name
 */
async function fetchAppointments(doctorName) {
  const loadingEl = document.getElementById('loading-message');
  const listEl = document.getElementById('appointments-list');
  listEl.innerHTML = ''; // Clear old results
  loadingEl.textContent = `Searching for ${doctorName}'s appointments...`;

  try {
    // ** We call the SAME API you built for your last feature! **
    const response = await fetch(`/api/appointments/doctor/${doctorName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const appointments = await response.json();
    loadingEl.textContent = ''; // Hide loading
    displayAppointments(appointments);

  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    loadingEl.textContent = 'Failed to load appointments.';
    loadingEl.style.color = 'red';
  }
}

/**
 * Renders the list of appointments on the page
 * (This is copied 1-to-1 from your my-appointments.js)
 */
function displayAppointments(appointments) {
  const listEl = document.getElementById('appointments-list');
  listEl.innerHTML = ''; // Clear the list

  if (appointments.length === 0) {
    listEl.innerHTML = '<p style="padding: 20px; text-align: center;">No appointments found for this doctor.</p>';
    return;
  }

  appointments.forEach(appt => {
    const cardEl = document.createElement('div');
    cardEl.className = 'appointment-card';

    const date = new Date(appt.appointment_date);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
    
    // We must use the correct column name 'appointment_time'
    const timeString = appt.appointment_time; 
    const [hours, minutes] = timeString.split(':');
    const time = new Date(year, date.getMonth(), day, hours, minutes);
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    cardEl.innerHTML = `
      <div class="appointment-date-bar">
        <span class="appointment-date-month">${month}</span>
        <span class="appointment-date-day">${day}</span>
        <span class="appointment-date-year">${year}</span>
      </div>
      <div class="appointment-details">
        <div class="appointment-info">
          <h4><i class="fas fa-user-injured"></i> ${appt.patient_name}</h4>
          <p>Status: <strong>${appt.status}</strong></p>
        </div>
        <div class="appointment-time">
          ${formattedTime}
        </div>
      </div>
    `;
    listEl.appendChild(cardEl);
  });
}