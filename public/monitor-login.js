const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginButton = document.getElementById('loginButton');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hide previous error
    errorMessage.classList.remove('show');
    loginButton.disabled = true;
    loginButton.textContent = 'Signing in...';

    try {
        const response = await fetch('/monitor/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // Successfully authenticated, get HTML and replace page
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
        } else {
            const data = await response.json();
            showError(data.message || 'Invalid credentials');
        }
    } catch (error) {
        showError('Connection error. Please try again.');
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 4000);
}
