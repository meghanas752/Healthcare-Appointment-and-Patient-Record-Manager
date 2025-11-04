// src/web/public/js/login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;
  const msgEl = document.getElementById('message');
  msgEl.textContent = '';

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) {
      msgEl.textContent = data.msg || 'Login failed';
      return;
    }

    // ✅ Instead of redirecting, just show success message
    msgEl.style.color = "green";
    msgEl.textContent = 'Login successful!';

    // (Optional) Store token/user if needed later
    // localStorage.setItem('hmprs_user', JSON.stringify(data.user));

  } catch (err) {
    console.error(err);
    msgEl.textContent = 'Network error';
  }
});
