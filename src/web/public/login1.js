// login1.js

document.addEventListener('DOMContentLoaded', () => {
  // We'll assume your form has id="loginForm"
  const loginForm = document.getElementById('loginForm'); 
  // We'll assume you have a message div with id="message"
  const messageEl = document.getElementById('message'); 

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      messageEl.textContent = '';
      messageEl.className = 'msg'; // Reset class
      messageEl.style.color = 'red'; // Default to error

      // Get values from the form inputs
      const identifier = document.getElementById('identifier').value.trim();
      const password = document.getElementById('password').value;

      try {
        // Use a relative path
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: identifier, 
            password: password
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Login failed.');
        }

        // --- THIS IS THE NEW INTEGRATION ---
        
        // 1. Show success message
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.style.color = 'green';
        
        // 2. Save the user's info in the browser's storage
        // This is how your dashboard will know who is logged in
        localStorage.setItem('user', JSON.stringify(result.user));

        // 3. Redirect based on their role (which we added in Phase 2)
        setTimeout(() => {
          if (result.user.role === 'DOCTOR') {
            // We must provide the FULL path from the root
            window.location.href = '/web/public/doctor-patient-profile.html'; 
          } else if (result.user.role === 'PATIENT') {
            // You'll need to create this page for your teammate
            window.location.href = '/web/public/appointments.html'; 
          } else {
            // Failsafe, just in case
            alert('Login successful, but your role is not recognized.');
          }
        }, 1500); // Wait 1.5 seconds

      } catch (error) {
        messageEl.textContent = error.message;
      }
    });
  }
});