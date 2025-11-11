// public/beds.js

// Get references to the HTML elements we will be working with
const patientSelect = document.getElementById('patientSelect');
const bedSelect = document.getElementById('bedSelect');
const allocationForm = document.getElementById('allocationForm');
const messageElement = document.getElementById('message');

// --- Function to fetch unassigned patients and populate the dropdown ---
async function populatePatients() {
    try {
        // 1. Fetch data from our new API endpoint
        const response = await fetch('/api/patients/unassigned');
        const patients = await response.json();

        // 2. Clear any existing options
        patientSelect.innerHTML = '<option value="">Select a patient...</option>';

        // 3. Add each patient as a new option in the dropdown
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (ID: ${patient.id})`;
            patientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load patients:', error);
        patientSelect.innerHTML = '<option value="">Could not load patients</option>';
    }
}

// --- Function to fetch beds and populate the dropdown ---
async function populateBeds() {
    try {
        // 1. Fetch data from the beds API endpoint
        const response = await fetch('/api/beds');
        const beds = await response.json();

        // 2. Clear any existing options
        bedSelect.innerHTML = '<option value="">Select a bed...</option>';

        // 3. Add ONLY the available beds to the dropdown
        beds.forEach(bed => {
            if (!bed.is_occupied) { // Check the 'is_occupied' status
                const option = document.createElement('option');
                option.value = bed.id;
                option.textContent = `${bed.ward_name} - ${bed.bed_number}`;
                bedSelect.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Failed to load beds:', error);
        bedSelect.innerHTML = '<option value="">Could not load beds</option>';
    }
}

// --- Event listener for the form submission ---
allocationForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const patientId = patientSelect.value;
    const bedId = bedSelect.value;

    try {
        const response = await fetch('/api/beds/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId, bedId })
        });

        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = result.message;
            messageElement.style.color = 'green';
            // Repopulate the dropdowns to show the updated lists
            populatePatients();
            populateBeds();
        } else {
            messageElement.textContent = 'Error: ' + result.error;
            messageElement.style.color = 'red';
        }
    } catch (error) {
        console.error('Failed to assign bed:', error);
        messageElement.textContent = 'A network error occurred.';
        messageElement.style.color = 'red';
    }
});

// --- Initial setup ---
// When the page loads, call the functions to fill the dropdowns immediately
populatePatients();
populateBeds();