const form = document.getElementById('loginForm');
const msg  = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Signing in...';
  const payload = { username: form.username.value.trim(), password: form.password.value };

  try {
    const res  = await fetch('/api/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });

    if (res.status === 423) {
      const d = await res.json();
      msg.textContent = `Account locked. Try after: ${d.lockedUntil || 'later'}`;
      return;
    }
    const d = await res.json();
    msg.textContent = d.ok ? 'Login success (placeholder)' : (d.msg || 'Login failed');
  } catch {
    msg.textContent = 'Network error.';
  }
});
