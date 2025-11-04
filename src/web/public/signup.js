

// Handle form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value.trim();

  const msgEl = document.getElementById('message');
  msgEl.textContent = '';

  if (!role) {
    msgEl.textContent = 'Please select a role.';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      msgEl.textContent = data.message || 'Signup failed';
      return;
    }

    msgEl.style.color = "green";
    msgEl.textContent = 'Signup successful!';
    // Example redirect:
    // window.location.href = '/dashboard.html';
  } catch (err) {
    console.error(err);
    msgEl.textContent = 'Network error';
  }
});
