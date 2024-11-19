document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('messageInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const resultsList = document.getElementById('resultsList');
    const receivedList = document.getElementById('receivedList');
    const sentList = document.getElementById('sentList');
    const sendBtn = document.getElementById('sendBtn');
    const logoutBtn = document.getElementById('logout');
    const MESSAGE_STORAGE_KEY = 'last10Messages';
    let lastMessages = JSON.parse(localStorage.getItem(MESSAGE_STORAGE_KEY)) || []; // Load from localStorage

    // Display the last 10 messages stored in localStorage
    function displayMessages(messages) {
        chatbox.innerHTML = ''; // Clear the chatbox
        messages.forEach((msg) => {
            const messageElement = document.createElement('p');
            messageElement.textContent = [${msg.timestamp}] ${msg.username}: ${msg.content};
            chatbox.appendChild(messageElement);
        });
    }

// Display search results in the searchResults list
async function displaySearchResults(users) {
    resultsList.innerHTML = ''; // Clear previous results
    if (users.length === 0) {
        const noResultElement = document.createElement('li');
        noResultElement.textContent = 'No users found.';
        resultsList.appendChild(noResultElement);
        return;
    }
    
    users.forEach((user) => {
        const userElement = document.createElement('li');
        userElement.textContent = user.name;
        userElement.classList.add('clickable');  // Add class to make it clickable

        // Attach click event listener to redirect to user.html with user details
        userElement.addEventListener('click', () => {
            // Save user data in localStorage for passing between pages
            localStorage.setItem('viewedUser', JSON.stringify(user));
            window.location.href = 'user.html';  // Redirect to user.html
        });

        resultsList.appendChild(userElement);
    });
}
// Fetch and display invitations
async function loadInvitations() {
    const token = localStorage.getItem('token');
    try {
        // Fetch sent invitations
        let response = await fetch('/api/invitations/sent', {
            headers: { 'Authorization': Bearer ${token} }
        });
        const sentInvitations = await response.json();
        displaySentInvitations(sentInvitations);
        // Fetch received invitations
         response = await fetch('/api/invitations/received', {
            headers: { 'Authorization': Bearer ${token} }
        });
        const receivedInvitations = await response.json();
        displayReceivedInvitations(receivedInvitations);

        

    } catch (error) {
        console.error('Error loading invitations:', error);
    }
}

// Display received invitations
function displayReceivedInvitations(invitations) {
    receivedList.innerHTML = '';
    invitations.forEach(invite => {
        const listItem = document.createElement('li');
        listItem.textContent = ${invite.ownerName} - ${invite.groupName};
        //console.log(invite.inviteId);

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';
        acceptBtn.addEventListener('click',()=>acceptInvitation(invite.inviteId));

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click',()=>cancelInvitation(invite.inviteId));

        listItem.appendChild(acceptBtn);
        listItem.appendChild(rejectBtn);
        receivedList.appendChild(listItem);
    });
}

// Display sent invitations
function displaySentInvitations(invitations) {
    sentList.innerHTML = '';
    invitations.forEach(invite => {
        const listItem = document.createElement('li');
        listItem.textContent = ${invite.groupName} - ${invite.receiverName};
       //console.log(invite.inviteId);
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => cancelInvitation(invite.inviteId));

        listItem.appendChild(cancelBtn);
        sentList.appendChild(listItem);
    });
}

// Accept an invitation
async function acceptInvitation(inviteId) {
    const token = localStorage.getItem('token');
    console.log(inviteId);
    try {
        const response = await fetch(/api/invitations/accept/${inviteId}, {
            method: 'PUT',
            headers: { 'Authorization': Bearer ${token} }
        });
        if (response.ok) {
            loadInvitations();
        } else {
            console.error('Error accepting invitation');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cancel an invitation
async function cancelInvitation(inviteId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(/api/invitations/cancel/${inviteId}, {
            method: 'DELETE',
            headers: { 'Authorization': Bearer ${token} }
        });
        if (response.ok) {
            loadInvitations();
        } else {
            console.error('Error canceling invitation');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initial load
loadInvitations();


// Search for users by name
 searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    const token = localStorage.getItem('token');
    
    if (query) {
        try {
            const response = await fetch(/api/users/search?query=${encodeURIComponent(query)}, {
                method: 'GET',
                headers: {
                    'Authorization': Bearer ${token}
                }
            });
            if (!response.ok) {
                throw new Error(Server error: ${response.status});
            }

            const users = await response.json();
            displaySearchResults(users);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    } else {
        alert('Please enter a search query.');
    }
});
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
//Send a new message 
logoutBtn.addEventListener('click', async () =>{
    const token = localStorage.getItem('token');
    try{
        const response = await fetch('/api/messages/logout',{
            method: 'PUT',
            headers:{
                'Content-type': 'application/json',
                'Authorization': Bearer ${token}
            },
            body:JSON.stringify({userStatus:'loggedOut'})
        });
        if(!response.ok){
            throw new Error(server error:${response.status})
        }else{
            localStorage.removeItem('token');
            window.location.href = '/login.html'
        }

    }catch (error) {
        console.error('Failed to logout:', error);
    }
})

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
                        'Authorization': Bearer ${token}
                    },
                    body: JSON.stringify({ content: message })
                });

                if (!response.ok) {
                    console.log(error);
                    throw new Error(Server error: ${response.status});
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
 

  // Redirect to group.html when clicking the "Create Group" button
  document.getElementById('createGroupBtn').addEventListener('click', function() {
    window.location.href = 'group.html';
});

// Redirect to group.html when clicking the "Create Group" button
document.getElementById('goToGroupsBtn').addEventListener('click', function() {
    window.location.href = 'group.html';
}); 