// login1.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm'); 
  const messageEl = document.getElementById('message'); 
  
  // ** NEW: Get the new counter elements **
  const failCounterCard = document.getElementById('fail-counter-card');
  const failCountEl = document.getElementById('fail-count');
  const loginButton = loginForm.querySelector('button[type="submit"]'); // Get the button

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // ** NEW: Reset UI on new submit **
      messageEl.textContent = '';
      messageEl.className = 'msg';
      loginButton.disabled = false;
      loginButton.textContent = 'Login';
      // Don't hide the fail counter card yet

      const identifier = document.getElementById('identifier').value.trim();
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: identifier, 
            password: password
          })
        });

        // ** NEW: Get the JSON body for BOTH success and error **
        const result = await response.json();

        if (!response.ok) {
          // --- THIS IS THE NEW ERROR HANDLING ---
          messageEl.textContent = result.message; // Use the server's message
          messageEl.style.color = 'red';

          if (response.status === 401 && result.failedAttempts) {
            // 401: Wrong Password
            updateFailCounter(result.failedAttempts);
            if (result.failedAttempts >= 5) {
              startLockout(30); // 30 second lockout
            }
          }
          if (response.status === 429) {
            // 429: Account is Already Locked
            updateFailCounter(5); // Show 5 attempts
            startLockout(30); // Start a 30 sec timer
          }
          return; // Stop the function here
        }

        // --- THIS IS THE SUCCESS LOGIC ---
        
        // 1. Show success message
        messageEl.textContent = 'Login successful! Redirecting...';
        messageEl.style.color = 'green';
        
        // ** NEW: Hide the fail counter on success **
        if(failCounterCard) {
            failCounterCard.classList.add('hidden');
        }
        
        // 2. Save the user's info
        localStorage.setItem('user', JSON.stringify(result.user));

        // 3. Redirect (Your existing logic - UNCHANGED)
        setTimeout(() => {
          if (result.user.role === 'DOCTOR') {
            window.location.href = '/web/public/doctor-patient-profile.html'; 
          } else if (result.user.role === 'STAFF') {
            window.location.href = '/web/public/appointments.html'; 
          } 
          else if (result.user.role === 'PHARMACIST') {
            window.location.href = '/web/public/appointments.html'; 
          } 
          else {
            alert('Login successful, but your role is not recognized.');
          }
        }, 1500);

      } catch (error) {
        // This catch is for NETWORK errors (server is down)
        console.error('Network Error:', err);
        messageEl.textContent = 'Network error. Please try again.';
        messageEl.style.color = 'red';
      }
    });
  }

  // --- NEW HELPER FUNCTIONS (Add these to the end of the file) ---

  /**
   * Shows the fail counter card and updates the count.
   */
  function updateFailCounter(count) {
    if (failCounterCard && failCountEl) {
      failCounterCard.classList.remove('hidden');
      failCountEl.textContent = count;
    }
  }

  /**
   * Disables the login button and starts a 30-second countdown timer.
   */
  function startLockout(seconds) {
    if (!loginButton || !messageEl) return;

    loginButton.disabled = true;
    let secondsLeft = seconds;
    
    // Set the message immediately
    messageEl.textContent = `Account locked. Please wait ${secondsLeft} seconds.`;
    messageEl.style.color = 'red';

    // Start a timer to update the message every second
    const timer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        messageEl.textContent = `Account locked. Please wait ${secondsLeft} seconds.`;
      } else {
        clearInterval(timer); // Stop the timer
        messageEl.textContent = 'Account unlocked. You can try again.';
        messageEl.style.color = 'green'; // Change to green to show it's unlocked
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
      }
    }, 1000); // 1000ms = 1 second
  }
});