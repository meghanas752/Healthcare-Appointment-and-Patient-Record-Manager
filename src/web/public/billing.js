// src/web/public/billing.js

document.addEventListener('DOMContentLoaded', () => {
    const patientSelect = document.getElementById('patientSelect');
    const generateBillBtn = document.getElementById('generateBillBtn');
    const billTableBody = document.getElementById('billTableBody');
    const totalCostEl = document.getElementById('totalCost');

    // --- 1. Populate the patient dropdown ---
    // This fetches all appointments from your friend's API
    async function populatePatients() {
        try {
            const response = await fetch('/api/appointments');
            const appointments = await response.json();
            
            patientSelect.innerHTML = '<option value="">Select an appointment...</option>';
            
            appointments.forEach(app => {
                const option = document.createElement('option');
                // The value is the appointment ID
                option.value = app.id; 
                // The text shows the patient name and date
                option.textContent = `${app.patient_name} (ID: ${app.id}) - ${new Date(app.appointment_date).toLocaleDateString()}`;
                patientSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load patients:', error);
            patientSelect.innerHTML = '<option value="">Could not load appointments</option>';
        }
    }

    // --- 2. Generate the bill when the button is clicked ---
    generateBillBtn.addEventListener('click', async () => {
        const appointmentId = patientSelect.value;
        if (!appointmentId) {
            alert('Please select a patient appointment.');
            return;
        }

        // Clear the old bill
        billTableBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Loading...</td></tr>';
        totalCostEl.textContent = '$0.00';

        try {
            // 3. Call your new billing API with the selected appointment ID
            const response = await fetch(`/api/billing/${appointmentId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bill');
            }
            const bill = await response.json();

            // 4. Clear the table
            billTableBody.innerHTML = '';

            // 5. Populate the table with new items
            if (bill.items.length === 0) {
                 billTableBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">No billable items found.</td></tr>';
            } else {
                bill.items.forEach(item => {
                    const row = billTableBody.insertRow();
                    row.insertCell(0).textContent = item.item;
                    const costCell = row.insertCell(1);
                    costCell.textContent = `$${parseFloat(item.cost || 0).toFixed(2)}`;
                    costCell.style.textAlign = 'right';
                });
            }

            // 6. Update the total
            totalCostEl.textContent = `$${bill.total}`;

        } catch (error) {
            console.error('Failed to generate bill:', error);
            billTableBody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: red;">Error generating bill.</td></tr>';
        }
    });

    // Load the patient list when the page opens
    populatePatients(); 
});