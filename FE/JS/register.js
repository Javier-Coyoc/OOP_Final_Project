// Connects to: POST /auth/register → authController.js

const fullNameInput     = document.getElementById('full_name');
const usernameInput     = document.getElementById('username');
const emailInput        = document.getElementById('email');
const roleSelect        = document.getElementById('role');
const passwordInput     = document.getElementById('password');
const confirmInput      = document.getElementById('confirm_password');
const registerBtn       = document.getElementById('register-btn');
const errorMsg          = document.getElementById('error-msg');

// ── HELPERS ──────────────────────────────────────────────────────────────────

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.color = '#c0392b';
}

function showSuccess(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.color = '#2d7a4f';
}

function clearError() {
  errorMsg.textContent = '';
}

function setLoading(isLoading) {
  registerBtn.disabled    = isLoading;
  registerBtn.textContent = isLoading ? 'Creating account...' : 'Create Account';
}

// ── VALIDATION ────────────────────────────────────────────────────────────────

function validate() {
  const full_name      = fullNameInput.value.trim();
  const username       = usernameInput.value.trim();
  const email          = emailInput.value.trim();
  const role           = roleSelect.value;
  const password       = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!full_name || !username || !email || !role || !password || !confirmPassword) {
    showError('All fields are required.');
    return null;
  }

  if (username.length < 3) {
    showError('Username must be at least 3 characters.');
    return null;
  }

  // basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError('Please enter a valid email address.');
    return null;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters.');
    return null;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match.');
    return null;
  }

  return { full_name, username, email, role, password };
}

// ── SUBMIT ────────────────────────────────────────────────────────────────────

async function handleRegister() {
  clearError();

  const payload = validate();
  if (!payload) return;

  setLoading(true);

  try {
    const res = await fetch('/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      showSuccess('Account created! Redirecting to login…');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      // server-side errors e.g. username already taken
      showError(data.message || 'Registration failed. Please try again.');
    }

  } catch (err) {
    showError('Server error. Please try again.');
    console.error('Register error:', err);
  } finally {
    setLoading(false);
  }
}

// ── EVENTS ────────────────────────────────────────────────────────────────────

registerBtn.addEventListener('click', handleRegister);

// Submit on Enter from confirm password field
confirmInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleRegister();
});

// Clear error as user types
[fullNameInput, usernameInput, emailInput, passwordInput, confirmInput].forEach(input => {
  input.addEventListener('input', clearError);
});
roleSelect.addEventListener('change', clearError);
