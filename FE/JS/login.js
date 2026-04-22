// Connects to: POST /auth/login → authController.js

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn      = document.getElementById('login-btn');
const errorMsg      = document.getElementById('error-msg');


loginBtn.addEventListener('click', handleLogin);
 
async function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
 
  // validation so sleepy
  if (!username || !password) {
    errorMsg.textContent = 'Please enter both username and password.';
    return;
  }
 
  // Disable button while request is in flight
  loginBtn.disabled    = true;
  loginBtn.textContent = 'Signing in...';
  errorMsg.textContent = '';
 
  try {
    const res = await fetch('/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
 
    const data = await res.json();
 
    if (res.ok && data.token) {
      // Store token + role from your users table (id, username, role, full_name)
      localStorage.setItem('token',     data.token);
      localStorage.setItem('role',      data.role);
      localStorage.setItem('full_name', data.full_name);
      localStorage.setItem('user_id',   data.id);
 
      // Route by role
      switch (data.role) {
        case 'Admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'Manager':
          window.location.href = '/manager/dashboard';
          break;
        case 'Cashier':
        default:
          window.location.href = '/pos';
          break;
      }
    } else {
      // Server returned an error (inactive account, wrong password, etc.)
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
 
// ── ENTER KEY SHORTCUT ──
passwordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleLogin();
});
 

// Prefills the username field with a default for that role
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const role = btn.dataset.role;
    const defaults = {
      cashier: 'cashier_01',
      manager: 'manager_ken',
      admin:   'admin_user',
    };
    if (defaults[role]) {
      usernameInput.value = defaults[role];
      passwordInput.focus();
    }
  });
});
 