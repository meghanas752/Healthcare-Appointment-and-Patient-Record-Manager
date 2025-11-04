// This global variable will store the ID of the patient we've searched for.
let currentPatientId = null;

/**
 * This is the main entry point. We wait for the HTML to be ready
 * before we try to find any buttons or forms.
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // --- Search Feature Setup ---
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('patient-name-input');
  
  // **DEFENSIVE CHECK #1:**
  // Only attach search listeners *if* the search elements exist on this page.
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
      const patientName = searchInput.value;
      if (patientName) {
        fetchPatientHistory(patientName);
      }
    });
    
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        searchButton.click();
      }
    });
  }

  // --- Prescription Feature Setup ---
  const prescriptionForm = document.getElementById('prescription-form');
  
  // **DEFENSIVE CHECK #2:**
  // Only attach the form listener *if* the prescription form exists on this page.
  if (prescriptionForm) {
    prescriptionForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Stop the form from reloading
      
      const details = document.getElementById('prescription-details').value;
      const messageEl = document.getElementById('prescription-message');
      
      // Hardcoding Doctor ID from your team's SQL file (e.g., 'alice', ID 6)
      // In a real app, this would come from the login session
      const doctorId = 6; 

      // Clear any old messages
      messageEl.className = 'hidden';
      messageEl.textContent = '';

      if (!currentPatientId) {
        alert("Please search for a patient first.");
        return;
      }
      
      if (!details) {
        alert("Please enter prescription details.");
        return;
      }

      try {
        // --- THIS IS THE API CALL ---
        const response = await fetch('http://localhost:3000/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: currentPatientId, 
            details: details
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to save prescription.');
        }
        
        // Success!
        messageEl.textContent = 'Prescription saved successfully!';
        messageEl.className = 'success';
        document.getElementById('prescription-details').value = ''; // Clear the textarea
        
        // **BONUS:** Refresh the history list to show the new prescription!
        const patientName = document.getElementById('patient-name-input').value;
        fetchPatientHistory(patientName);

      } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'error';
      }
    });
  }
});


/**
 * Fetches patient data and history from the backend API.
 */
async function fetchPatientHistory(patientName) {
  const loadingEl = document.getElementById('history-loading');
  const listEl = document.getElementById('history-list');
  const nameDisplayEl = document.getElementById('patient-name-display');
  const resultsContainer = document.getElementById('results-container');
  const prescriptionMessageEl = document.getElementById('prescription-message');
  
  // Clear any old prescription messages
  if (prescriptionMessageEl) {
    prescriptionMessageEl.className = 'hidden';
  }

  // 1. Show loading and clear old results
  loadingEl.textContent = 'Searching...';
  listEl.innerHTML = '';
  nameDisplayEl.textContent = '';
  resultsContainer.classList.add('hidden'); // Hide results while loading

  try {
    const response = await fetch(`http://localhost:3000/api/patients/search?name=${encodeURIComponent(patientName)}`);
    
    if (response.status === 404) {
      throw new Error('Patient not found.');
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const historyData = data.history;
    const patient = data.patient;

    // ** Store the patient ID globally **
    currentPatientId = patient.id; 

    // 3. Hide loading message
    loadingEl.textContent = '';
    
    // 4. Show the results container
    resultsContainer.classList.remove('hidden');
    
    // 5. Display patient name
    nameDisplayEl.textContent = `Displaying History for: ${patientName} (ID: ${patient.id})`;
    
    // 6. Update the new stat cards
    updateStats(historyData);
    
    // 7. Display the history data
    displayHistory(historyData);

  } catch (error) {
    console.error('Failed to fetch history:', error);
    loadingEl.textContent = error.message;
    loadingEl.style.color = 'red';
    // Don't show the results container if there's an error
    resultsContainer.classList.add('hidden');
    
    // ** Clear the patient ID on error **
    currentPatientId = null;
  }
}

/**
 * Updates the "Stat Cards" with summary info.
 */
function updateStats(historyData) {
  const lastVisitEl = document.getElementById('stat-last-visit');
  const allergiesEl = document.getElementById('stat-allergies');
  const totalRecordsEl = document.getElementById('stat-total-records');

  // Total Records
  totalRecordsEl.textContent = historyData.length;

  // Last Visit (since data is sorted, first item is the most recent)
  if (historyData.length > 0) {
    lastVisitEl.textContent = new Date(historyData[0].date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } else {
    lastVisitEl.textContent = 'N/A';
  }

  // Known Allergies
  const allergyCount = historyData.filter(item => item.type === 'Allergy').length;
  allergiesEl.textContent = allergyCount;
  
  // Make the allergy card red if count > 0
  if (allergyCount > 0) {
    allergiesEl.parentElement.classList.add('allergy-card');
  } else {
    allergiesEl.parentElement.classList.remove('allergy-card');
  }
}

/**
 * Renders the list of history items on the page.
 */
function displayHistory(historyData) {
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = ''; // Clear the list

  if (historyData.length === 0) {
    listEl.innerHTML = '<p style="padding: 20px; text-align: center;">No medical history found for this patient.</p>';
    return;
  }

  historyData.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'history-item';

    // Format the date
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    // Get the right icon
    let iconClass = 'fa-file-medical'; // default
    if (item.type === 'Diagnosis') iconClass = 'fa-stethoscope';
    if (item.type === 'Prescription') iconClass = 'fa-pills';
    if (item.type === 'Allergy') iconClass = 'fa-exclamation-triangle';

    // Create the new HTML structure inspired by your screenshot
    itemEl.innerHTML = `
      <div class="history-item-main">
        <span class="history-item-type">
          <i class="fas ${iconClass}"></i> ${item.type}
        </span>
        <p class="history-item-details">${item.details}</p>
      </div>
      <div class="history-item-date">
        ${formattedDate}
      </div>
    `;
    listEl.appendChild(itemEl);
  });
}