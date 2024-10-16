// scripts.js
document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    // Fetch messages from the server
    async function loadMessages() {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        
        chatbox.innerHTML = ''; // Clear the chatbox
        messages.forEach((msg) => {
            const messageElement = document.createElement('p');
            messageElement.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.content}`;
            chatbox.appendChild(messageElement);
        });
    }

    // Send a new message
    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        const token = localStorage.getItem('token');
        if(token){
            console.log('Token fetched successfully');
        }
    
        if (message !== '') {
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: message })
                });
    
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
    
                messageInput.value = ''; // Clear input field
                loadMessages(); // Reload messages
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    });

    loadMessages(); // Initial load
});
