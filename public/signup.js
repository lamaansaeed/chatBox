document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Capture form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Prepare payload
    const payload = {
        name: name,
        email: email,
        password: password
    };

    try {
        console.log('i am here 1');
        const response = await fetch('http://16.16.36.242:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Display response message
        document.getElementById('responseMessage').textContent = result.message;
    } catch (error) {
        console.error('Error:', error);
    }
});