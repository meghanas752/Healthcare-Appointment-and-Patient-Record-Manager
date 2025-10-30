// src/web/scripts/history.js

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('patient-name-input');

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
});

async function fetchPatientHistory(patientName) {
  const loadingEl = document.getElementById('history-loading');
  const listEl = document.getElementById('history-list');
  const nameDisplayEl = document.getElementById('patient-name-display');
  const resultsContainer = document.getElementById('results-container');

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
  }
}

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