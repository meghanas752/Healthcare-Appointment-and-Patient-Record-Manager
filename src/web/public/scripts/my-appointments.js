// src/web/scripts/my-appointments.js

document.addEventListener('DOMContentLoaded', () => {
  
  // --- AUTH GUARD (Copied from history.js) ---
  const userString = localStorage.getItem('user');
  let loggedInUser = null;
  
  if (!userString) {
    alert('You must be logged in to view this page.');
    window.location.href = '/login1.html'; // Go back to login
    return; // Stop running
  }

  try {
    loggedInUser = JSON.parse(userString);
  } catch (e) {
    alert('Invalid session. Please log in again.');
    window.location.href = '/login1.html';
    return;
  }
  
  if (loggedInUser.role !== 'DOCTOR') {
    alert('Access denied. This page is for Doctors only.');
    window.location.href = '/login1.html';
    return;
  }

  // Update the sidebar with the logged-in doctor's name
  const doctorNameEl = document.querySelector('.sidebar-footer strong');
  if (doctorNameEl) {
    doctorNameEl.textContent = loggedInUser.username;
  }
  // --- END OF AUTH GUARD ---

  
  // --- LOGOUT BUTTON (Copied from history.js) ---
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault(); 
      localStorage.removeItem('user');
      alert('You have been logged out.');
      window.location.href = '/login1.html';
    });
  }
  
  // --- NEW: Fetch appointments for the logged-in doctor ---
  // We use the 'username' from localStorage
  fetchAppointments(loggedInUser.username);
});


/**
 * Fetches appointments for the given doctor name
 */
async function fetchAppointments(doctorName) {
  const loadingEl = document.getElementById('loading-message');
  const listEl = document.getElementById('appointments-list');

  try {
    // We call the new API route we just built
    const response = await fetch(`/api/appointments/doctor/${doctorName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const appointments = await response.json();
    loadingEl.style.display = 'none'; // Hide loading
    displayAppointments(appointments);

  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    loadingEl.textContent = 'Failed to load appointments.';
    loadingEl.style.color = 'red';
  }
}

/**
 * Renders the list of appointments on the page
 */
// ***** REPLACE THIS FUNCTION in my-appointments.js *****

// ***** REPLACE THIS FUNCTION in my-appointments.js *****

function displayAppointments(appointments) {
  const listEl = document.getElementById('appointments-list');
  listEl.innerHTML = ''; // Clear the list

  if (appointments.length === 0) {
    listEl.innerHTML = '<p style="padding: 20px; text-align: center;">You have no appointments scheduled.</p>';
    return;
  }

  appointments.forEach(appt => {
    // ** THE FIX: Change from 'div' to 'a' (link) **
    const cardEl = document.createElement('a'); 
    cardEl.className = 'appointment-card';
    // ** THE FIX: Set the link to the new detail page **
    // This will create a link like "appointment-detail.html?id=2"
    cardEl.href = `appointment-detail.html?id=${appt.id}`; 

    // ... (all your existing code for date, month, day, year, timeString, etc.) ...
    const date = new Date(appt.appointment_date);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
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