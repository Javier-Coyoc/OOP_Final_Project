// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');
    
    const fullNameInput = document.getElementById('full_name');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const roleSelect = document.getElementById('role');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const registerBtn = document.getElementById('register-btn');
    const errorMsg = document.getElementById('error-msg');

    if (!registerBtn) {
        console.error('Register button not found!');
        return;
    }

    console.log('Register button found');

    function showError(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.color = '#c0392b';
            errorMsg.style.backgroundColor = '#fee';
            errorMsg.style.padding = '12px';
            errorMsg.style.borderRadius = '8px';
            errorMsg.style.marginBottom = '20px';
            errorMsg.style.border = '1px solid #f5c6cb';
            errorMsg.style.display = 'block';
        }
    }

    function showSuccess(msg) {
        if (errorMsg) {
            errorMsg.textContent = msg;
            errorMsg.style.color = '#155724';
            errorMsg.style.backgroundColor = '#d4edda';
            errorMsg.style.padding = '12px';
            errorMsg.style.borderRadius = '8px';
            errorMsg.style.marginBottom = '20px';
            errorMsg.style.border = '1px solid #c3e6cb';
            errorMsg.style.display = 'block';
        }
    }

    function clearError() {
        if (errorMsg) {
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
        }
    }

    function setLoading(isLoading) {
        if (registerBtn) {
            registerBtn.disabled = isLoading;
            registerBtn.textContent = isLoading ? 'Creating account...' : 'Create Account';
            registerBtn.style.opacity = isLoading ? '0.7' : '1';
            registerBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
        }
    }

    async function handleRegister(event) {
        if (event) event.preventDefault();
        
        console.log('Register button clicked');
        clearError();

        const full_name = fullNameInput ? fullNameInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const role = roleSelect ? roleSelect.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmInput ? confirmInput.value : '';

        if (!full_name || !username || !email || !role || !password || !confirmPassword) {
            showError('⚠️ All fields are required.');
            return;
        }

        if (username.length < 3) {
            showError('⚠️ Username must be at least 3 characters.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('⚠️ Please enter a valid email address.');
            return;
        }

        if (password.length < 4) {
            showError('⚠️ Password must be at least 4 characters.');
            return;
        }

        if (password !== confirmPassword) {
            showError('⚠️ Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            console.log('Sending request to /auth/register...');
            
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name,
                    username,
                    email,
                    role,
                    password
                })
            });

            const data = await response.json();
            console.log('Response:', data);

            if (response.ok) {
                showSuccess('✅ Account created successfully! Redirecting to login...');
                
                if (fullNameInput) fullNameInput.value = '';
                if (usernameInput) usernameInput.value = '';
                if (emailInput) emailInput.value = '';
                if (roleSelect) roleSelect.value = '';
                if (passwordInput) passwordInput.value = '';
                if (confirmInput) confirmInput.value = '';
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showError(data.message || '❌ Registration failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('❌ Cannot connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    }

    registerBtn.addEventListener('click', handleRegister);
    
    const inputs = [fullNameInput, usernameInput, emailInput, passwordInput, confirmInput];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegister();
                }
            });
        }
    });
    
    console.log('Event listeners attached successfully');
});