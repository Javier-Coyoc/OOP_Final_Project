// Connects to: POST /auth/login → authController.js

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn      = document.getElementById('login-btn');
const errorMsg      = document.getElementById('error-msg');

loginBtn.addEventListener('click', handleLogin);
 
async function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
 
  if (!username || !password) {
    errorMsg.textContent = 'Please enter both username and password.';
    return;
  }
 
  loginBtn.disabled    = true;
  loginBtn.textContent = 'Signing in...';
  errorMsg.textContent = '';
 
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token',     data.token);
      localStorage.setItem('role',      data.role);
      localStorage.setItem('full_name', data.full_name);
      localStorage.setItem('user_id',   data.id);
      
    window.location.href = '/';
      
    } else {
      errorMsg.textContent = data.message || 'Invalid credentials. Try again.';
    }
 
  } catch (err) {
    errorMsg.textContent = 'Server error. Please try again.';
    console.error('Login error:', err);
  } finally {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Sign In';
  }
}
 
// Enter key shortcut
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});