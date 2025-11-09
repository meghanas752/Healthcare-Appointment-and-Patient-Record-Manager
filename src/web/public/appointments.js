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
  // ✅ LOGOUT FUNCTIONALITY ADDED
  // ==============================
  document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
          // Optional backend logout call if available
          // await fetch('/api/auth/logout', { method: 'POST' });

          // Clear any session or login flags
          sessionStorage.clear();
          localStorage.clear();

          // ✅ Redirect to login page
          window.location.href = '/web/public/login1.html';
        } catch (error) {
          console.error('Logout failed:', error);
          // Even if something goes wrong, redirect anyway
          window.location.href = '/web/public/login1.html';
        }
      });
    }
  });
