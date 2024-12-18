document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById('chatbox');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const logoutBtn = document.getElementById('logout');
    const MESSAGE_STORAGE_KEY = 'last10Messages';
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const resultsList = document.getElementById('resultsList');
    const receivedList = document.getElementById('receivedList');
    const sentList = document.getElementById('sentList');
    
    let lastFetchedMessageId = null; // To track last fetched message for infinite scroll
    let isFetching = false; // Prevent multiple fetches at the same time

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
}// Fetch and display invitations
async function loadInvitations() {
    const token = localStorage.getItem('token');
    try {
        // Fetch sent invitations
        let response = await fetch('/api/invitations/sent', {
            headers: { 'Authorization':` Bearer ${token} `}
        });
        const sentInvitations = await response.json();
        displaySentInvitations(sentInvitations);
        // Fetch received invitations
         response = await fetch('/api/invitations/received', {
            headers: { 'Authorization':` Bearer ${token}` }
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
        listItem.textContent = `${invite.ownerName} - ${invite.groupName}`;
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
//Display sent invitations
function displaySentInvitations(invitations) {
    sentList.innerHTML = '';
    invitations.forEach(invite => {
        const listItem = document.createElement('li');
        listItem.textContent = `${invite.groupName} - ${invite.receiverName}`;
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
        const response = await fetch(`/api/invitations/accept/${inviteId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
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
        const response = await fetch(`/api/invitations/cancel/${inviteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
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
// Search for users by name
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    const token = localStorage.getItem('token');
    
    if (query) {
        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(Server `error: ${response.status}`);
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
logoutBtn.addEventListener('click', async () =>{
    const token = localStorage.getItem('token');
    try{
        const response = await fetch('/api/messages/logout',{
            method: 'PUT',
            headers:{
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body:JSON.stringify({userStatus:'loggedOut'})
        });
        if(!response.ok){
            throw new Error(`server error:${response.status}`)
        }else{
            localStorage.removeItem('token');
            window.location.href = '/login.html'
        }

    }catch (error) {
        console.error('Failed to logout:', error);
    }
})

    // Connect to Socket.IO server with token authentication
    const socket = io({
        auth: {
            token: localStorage.getItem('token') // Attach token
        }
    });

    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    socket.on('receiveMessage', (payload) => {
        const messageElement = document.createElement('p');
        messageElement.textContent = `[${new Date(payload.timestamp).toLocaleString()}] ${payload.username}: ${payload.content}`;
        chatbox.appendChild(messageElement);
        
        // Scroll to bottom to see new messages
        chatbox.scrollTop = chatbox.scrollHeight;
    });

    // Send a new message
    sendBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('sendMessage', {
                message,
                groupId: null, // Assuming default messaging, no group
            });
    
            // // Render locally after send for immediate feedback
            // const messageElement = document.createElement('p');
            // messageElement.textContent = `[${new Date().toLocaleString()}] You: ${message}`;
            // chatbox.appendChild(messageElement);
            
             messageInput.value = '';  // Clear input
             chatbox.scrollTop = chatbox.scrollHeight;
        }
    });
    

    // Infinite scroll: Fetch older messages when user scrolls to top
    chatbox.addEventListener('scroll', async () => {
        if (chatbox.scrollTop === 0 && !isFetching) {
            isFetching = true;

            try {
                const response = await fetch(`/api/messages?before=${encodeURIComponent(lastFetchedMessageId || '')}`);
                const olderMessages = await response.json();

                if (olderMessages.length > 0) {
                    lastFetchedMessageId = olderMessages[0].id; // Update last fetched message ID
                    
                    olderMessages.reverse().forEach((msg) => {
                        const messageElement = document.createElement('p');
                        messageElement.textContent = `[${new Date(msg.createdAt).toLocaleString()}] ${msg.username}: ${msg.content}`;
                        chatbox.insertBefore(messageElement, chatbox.firstChild);
                    });
                }
            } catch (error) {
                console.error('Failed to load older messages:', error);
            } finally {
                isFetching = false;
            }
        }
    });

    // Load initial messages
    async function loadInitialMessages() {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();

            if (messages.length > 0) {
                lastFetchedMessageId = messages[messages.length - 1].id; // Set to the last message ID
            }

            messages.forEach((msg) => {
                const messageElement = document.createElement('p');
                messageElement.textContent = `[${new Date(msg.createdAt).toLocaleString()}] ${msg.username}: ${msg.content}`;
                chatbox.appendChild(messageElement);
            });

            // Scroll to bottom to see the most recent messages
            chatbox.scrollTop = chatbox.scrollHeight;
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }
     
    // Logout function
    logoutBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/messages/logout', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userStatus: 'loggedOut' })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            } else {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    });
    
    // Load initial messages when the page is ready
   loadInitialMessages();
   loadInvitations();
});
//Redirect to group.html when clicking the "Create Group" button
  document.getElementById('createGroupBtn').addEventListener('click', function() {
    window.location.href = 'group.html';
});

// Redirect to group.html when clicking the "Create Group" button
document.getElementById('goToGroupsBtn').addEventListener('click', function() {
    window.location.href = 'group.html';
});