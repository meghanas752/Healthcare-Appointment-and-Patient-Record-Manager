// signup.js

// Wrap everything in a DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
  
  // Find the form and message elements
  const signupForm = document.getElementById('signupForm');
  const msgEl = document.getElementById('message');

  // Only run if the form actually exists on this page
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      
      // Get the role and convert it to UPPERCASE for the database
      const role = document.getElementById('role').value.trim().toUpperCase(); 

      msgEl.textContent = '';
      msgEl.style.color = 'red'; // Default to error color

      if (!role) {
        msgEl.textContent = 'Role is required (e.g., DOCTOR or PATIENT).';
        return;
      }

      try {
        // Use a relative path, which is safer now that your server is set up
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          // If the server sends an error (like 409 "Email already exists"), show it
          msgEl.textContent = data.message || 'Signup failed';
          return;
        }

        // --- THIS IS THE NEW INTEGRATION ---
        msgEl.style.color = "green";
        msgEl.textContent = 'Signup successful! Redirecting to login...';
        
        // Wait 2 seconds so the user can read the message, then redirect
        setTimeout(() => {
        window.location.href = '/web/public/login1.html'; // Use the full path
        }, 2000);

      } catch (err) {
        console.error(err);
        msgEl.textContent = 'Network error';
      }
    });
  }
});