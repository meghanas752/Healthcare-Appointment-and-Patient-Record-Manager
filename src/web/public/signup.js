// signup.js

// Wrap everything in a DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
  
  // === ROLE BUTTON LOGIC ===
  const roleButtons = document.querySelectorAll('.role-btn');
  const hiddenRoleInput = document.getElementById('role');

  if (roleButtons.length > 0) {
    roleButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active state from all buttons
        roleButtons.forEach(btn => btn.classList.remove('active'));
        // Highlight selected button
        button.classList.add('active');
        // Store the selected role in hidden input
        hiddenRoleInput.value = button.dataset.role;
      });
    });
  }

  // === SIGNUP FORM LOGIC ===
  const signupForm = document.getElementById('signupForm');
  const msgEl = document.getElementById('message');

  // Only run if the form actually exists on this page
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const role = hiddenRoleInput.value.trim().toUpperCase();  // Get from hidden input

      msgEl.textContent = '';
      msgEl.style.color = 'red'; // Default color

      if (!role) {
        msgEl.textContent = 'Please select a role (Doctor, Staff, or Pharmacist).';
        return;
      }

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
          msgEl.textContent = data.message || 'Signup failed';
          return;
        }

        msgEl.style.color = 'green';
        msgEl.textContent = 'Signup successful! Redirecting to login...';

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/web/public/login1.html';
        }, 2000);

      } catch (err) {
        console.error(err);
        msgEl.textContent = 'Network error';
      }
    });
  }
});
