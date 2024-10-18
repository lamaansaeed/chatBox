document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const MESSAGE_STORAGE_KEY = 'last10Messages';
    let lastMessages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY)) || []; // Load from localStorage

    // Display the last 10 messages stored in localStorage
    function displayMessages(messages) {
        chatbox.innerHTML = ''; // Clear the chatbox
        messages.forEach((msg) => {
            const messageElement = document.createElement('p');
            messageElement.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.content}`;
            chatbox.appendChild(messageElement);
        });
    }

    // Fetch new messages from the server
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();

        // Filter out duplicates
        const newMessages = messages.filter(msg => 
            !lastMessages.some(lastMsg => lastMsg.timestamp === msg.timestamp && lastMsg.content === msg.content)
        );

        // Merge new messages with the old, but keep only the last 10
        const combinedMessages = [...lastMessages, ...newMessages].slice(-10);

        // Save to localStorage
        localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(combinedMessages));

        // Display on the screen
        displayMessages(combinedMessages);

        // Update the local lastMessages array
        lastMessages = combinedMessages;
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}


    // Send a new message
    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        const token = localStorage.getItem('token');

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

    // Continuously call the API every 1 second to fetch new messages
    setInterval(() => {
        loadMessages();
    }, 3000); // Fetch every 1 second

    // Initial load of messages from localStorage
    displayMessages(lastMessages);
});
  