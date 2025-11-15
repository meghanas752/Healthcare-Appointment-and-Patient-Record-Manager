// src/web/scripts/appointment-detail.js

// This global variable will store the ID of the appointment we are viewing
let currentAppointmentId = null;

document.addEventListener('DOMContentLoaded', () => {
  
  // --- AUTH GUARD (Copied from your other scripts) ---
  const userString = localStorage.getItem('user');
  let loggedInUser = null;
  
  if (!userString) {
    alert('You must be logged in to view this page.');
    window.location.href = '/login1.html';
    return;
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
  const doctorNameEl = document.querySelector('.sidebar-footer strong');
  if (doctorNameEl) {
    doctorNameEl.textContent = loggedInUser.username;
  }
  // --- END OF AUTH GUARD ---

  
  // --- LOGOUT BUTTON (Copied from your other scripts) ---
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault(); 
      localStorage.removeItem('user');
      alert('You have been logged out.');
      window.location.href = '/login1.html';
    });
  }
  
  // --- NEW: Get Appointment ID from URL and Fetch Details ---
  const params = new URLSearchParams(window.location.search);
  currentAppointmentId = params.get('id'); // Store ID globally

  if (!currentAppointmentId) {
    alert('Error: No appointment ID specified.');
  } else {
    fetchAppointmentDetails(currentAppointmentId);
  }

  // --- NEW: Add submit listener for the prescription form ---
  const prescriptionForm = document.getElementById('prescription-form');
  if (prescriptionForm) {
    prescriptionForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const details = document.getElementById('prescription-details').value;
      const cost = document.getElementById('prescription-cost').value;
      const messageEl = document.getElementById('prescription-message');

      if (!details || !cost) {
        alert('Please fill in both prescription details and cost.');
        return;
      }
      
      try {
        const response = await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: currentAppointmentId,
            details: details,
            cost: cost
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to save prescription.');
        }

        // Success!
        messageEl.textContent = 'Prescription saved successfully!';
        messageEl.className = 'success';
        
        // Clear the form
        document.getElementById('prescription-details').value = '';
        document.getElementById('prescription-cost').value = '';
        
        // **BONUS:** Refresh the data to show the new prescription!
        fetchAppointmentDetails(currentAppointmentId); 

      } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'error';
      }
    });
  }

  const treatmentForm = document.getElementById('treatment-form');
  if (treatmentForm) {
    treatmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const details = document.getElementById('treatment-details').value;
      const cost = document.getElementById('treatment-cost').value;
      const messageEl = document.getElementById('treatment-message');

      if (!details || !cost) {
        alert('Please fill in both treatment details and cost.');
        return;
      }

      // Clear old messages
      messageEl.className = 'hidden';
      messageEl.textContent = '';
      
      try {
        // --- THIS IS THE NEW API CALL ---
        const response = await fetch('/api/treatments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: currentAppointmentId,
            details: details,
            cost: cost
          })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to save treatment.');
        }

        // Success!
        messageEl.textContent = 'Treatment saved successfully!';
        messageEl.className = 'success';
        
        // Clear the form
        document.getElementById('treatment-details').value = '';
        document.getElementById('treatment-cost').value = '';
        
        // **BONUS:** Refresh the data to show the new treatment!
        fetchAppointmentDetails(currentAppointmentId); 

      } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'error';
      }
    });
  }
  // --- **** END OF NEW BLOCK **** ---
});


/**
 * Fetches all details for a single appointment
 */
async function fetchAppointmentDetails(appointmentId) {
  const loadingEl = document.getElementById('loading-message');
  const detailsContainer = document.getElementById('details-container');
  const prescriptionMessageEl = document.getElementById('prescription-message');

  // Hide old messages
  if (prescriptionMessageEl) prescriptionMessageEl.className = 'hidden';
  loadingEl.style.display = 'block';
  detailsContainer.classList.add('hidden');

  try {
    // We call the new API route we just built
    const response = await fetch(`/api/appointments/${appointmentId}/details`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // { appointment, treatments, prescriptions }
    loadingEl.style.display = 'none'; // Hide loading
    detailsContainer.classList.remove('hidden'); // Show details
    
    // 1. Fill in header
    document.getElementById('patient-name-header').textContent = `Patient: ${data.appointment.patient_name}`;
    const apptDate = new Date(data.appointment.appointment_date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('appointment-date-header').textContent = `Appointment on ${apptDate}`;

    // 2. Fill in Treatments
    displayList(data.treatments, 'treatments-list', 'No treatments recorded for this visit.');
    
    // 3. Fill in Prescriptions
    displayList(data.prescriptions, 'prescriptions-list', 'No prescriptions issued for this visit.');

  } catch (error) {
    console.error('Failed to fetch appointment details:', error);
    loadingEl.textContent = 'Failed to load appointment details.';
    loadingEl.style.color = 'red';
  }
}

/**
 * Generic function to render a list of items (treatments or prescriptions)
 */
// ***** REPLACE THIS FUNCTION *****

/**
 * Generic function to render a list of items (treatments or prescriptions)
 * (FIXED: Now displays the date for all items)
 */
function displayList(items, listElementId, emptyMessage) {
  const listEl = document.getElementById(listElementId);
  listEl.innerHTML = ''; // Clear the list

  if (items.length === 0) {
    listEl.innerHTML = `<p style="padding: 20px;">${emptyMessage}</p>`;
    return;
  }

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'history-item'; // Reuse your existing style
    
    // --- THIS IS THE NEW LOGIC ---
    // Format the date for this item
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    // --- END OF NEW LOGIC ---

    const cost = item.cost ? ` (Cost: $${parseFloat(item.cost).toFixed(2)})` : '';
    
    // Get the right icon
    let iconClass = 'fa-file-medical'; // default
    if (listElementId === 'treatments-list') iconClass = 'fa-heartbeat';
    // if (listElementId === 'prescriptions-list') iconClass = 'fa-pills';

    // --- THIS IS THE HTML CHANGE ---
    // We've added the 'history-item-date' div,
    // just like in your 'my-appointments' page.
    itemEl.innerHTML = `
      <div class="history-item-main">
        <span class="history-item-type">
          <i class="fas ${iconClass}"></i> ${item.details}
        </span>
      </div>
      <div class="history-item-date">
        ${formattedDate}
      </div>
    `;
    // --- END OF HTML CHANGE ---
    
    listEl.appendChild(itemEl);
  });
}