// --- NEW CORRECT CODE (REPLACE WITH THIS) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- START: Role-Based Menu Logic ---

    // 1. Get the user *data string* from localStorage (using the key 'user')
    const userDataString = localStorage.getItem('user'); 
    const billingLink = document.getElementById('billing-nav-link');

    // 2. Check if the data and the link both exist
    if (userDataString && billingLink) {
        try {
            // 3. Parse the string into a JavaScript object
            const user = JSON.parse(userDataString);

            // 4. Check the 'role' property inside the object for "STAFF"
            if (user.role === 'STAFF') {
                billingLink.style.display = 'block'; // This will show the link
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    // --- END: Role-Based Menu Logic ---
});
async function loadAppointments() {
  const res = await fetch("http://localhost:3000/api/appointments");
  const data = await res.json();

  const tbody = document.querySelector("#appointmentsTable tbody");
  tbody.innerHTML = "";

  data.forEach(app => {
    const row = `
      <tr>
        <td>${app.id}</td>
        <td>${app.patient_name}</td>
        <td>${app.patient_email || "-"}</td>        <!-- ⭐ ADDED -->
        <td>${app.patient_contact || "-"}</td>      <!-- ⭐ ADDED -->
        <td>${app.doctor_name}</td>
        <td>${app.appointment_date}</td>
        <td>${app.appointment_time}</td>
        <td>${app.status}</td>
        <td>
          <button onclick="deleteAppointment(${app.id})">Cancel</button>
        </td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

document.getElementById("appointmentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newAppointment = {
    patient_name: document.getElementById("patient_name").value,
    patient_email: document.getElementById("patient_email").value,     // ⭐ ADDED
    patient_contact: document.getElementById("patient_contact").value, // ⭐ ADDED
    doctor_name: document.getElementById("doctor_name").value,
    appointment_date: document.getElementById("appointment_date").value,
    appointment_time: document.getElementById("appointment_time").value
  };

  await fetch("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newAppointment)
  });

  console.log("✅ Appointment booked");
  loadAppointments();
});

async function deleteAppointment(id) {
  await fetch(`http://localhost:3000/api/appointments/${id}`, { method: "DELETE" });
  console.log(`❌ Appointment ${id} deleted`);
  loadAppointments();
}

// Load when page opens
loadAppointments();


// ==============================
// ✅ LOGOUT FUNCTIONALITY
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/web/public/login1.html';
      } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/web/public/login1.html';
      }
    });
  }
});


// ==============================
// ✅ SHOW LOGGED IN USER
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (storedUser && storedUser.username) {
    const nameBox = document.getElementById("loggedUser");
    nameBox.textContent = storedUser.username;
  }
});
