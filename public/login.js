

console.log('Login script loaded');
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Capture form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Prepare payload
    const payload = {
        email: email,
        password: password
    };

    try {
        console.log('i am here 1')
        console.log('Attempting login');
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        document.getElementById('responseMessage').textContent = result.message;

        if (result.success) {
            // Store JWT token in localStorage
            localStorage.setItem('token', result.token);
           // 
           // window.location.href = '/expense.html'; // Redirect after successful login
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
document.getElementById('forgotPasswordButton').addEventListener('click', function() {
    document.getElementById('forgotPasswordForm').style.display = 'block';
});

document.getElementById('forgotPasswordForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('forgotEmail').value;

    try {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        document.getElementById('responseMessage').textContent = result.message;
    } catch (error) {
        console.error('Error:', error);
    }
});
document.getElementById('signupButton').addEventListener('click', function() {
            // Redirect to signup.html
            window.location.href = 'signup.html';
        });
