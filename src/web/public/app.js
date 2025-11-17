// public/app.js

//mai
import inventoryRoutes from "./routes/inventory.js";
app.use("/api/inventory", inventoryRoutes);

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 1. Get the data from ALL form inputs, including the new ones.
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const medicalHistory = document.getElementById('medicalHistory').value;
    const currentMedications = document.getElementById('currentMedications').value;

    // 2. Package ALL the data into a JavaScript object.
    // The keys here (e.g., 'medicalHistory') must match what the backend expects (see Step 2).
    const patientData = {
        firstName,
        lastName,
        phone,
        medicalHistory,
        currentMedications
    };

    const messageElement = document.getElementById('message');

    // 3. The rest of the code is the same! It sends the complete data package.
    try {
        const response = await fetch('/api/patients/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = result.message;
            messageElement.style.color = 'green';
            document.getElementById('registrationForm').reset();
        } else {
            messageElement.textContent = 'Error: ' + result.error;
            messageElement.style.color = 'red';
        }
    } catch (error) {
        console.error('Failed to submit form:', error);
        messageElement.textContent = 'A network error occurred. Please try again.';
        messageElement.style.color = 'red';
    }
});

