document.getElementById('groupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form from submitting normally

    const groupName = document.getElementById('groupName').value.trim();
    const messageDiv = document.getElementById('message');
    const token = localStorage.getItem('token');
    
    
    


    if (groupName !== '') {
        try {
            const response = await fetch('/api/groups/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // JWT for authentication
                },
                body: JSON.stringify({ groupName })
            });

            const result = await response.json();

            if (response.ok && result.isUnique) {
                const createGroupResponse = await fetch('/api/groups/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ groupName })
                });

                if (createGroupResponse.ok) {
                    messageDiv.textContent = 'Group created successfully!';
                    messageDiv.style.color = 'green';
                    loadGroups(); // Reload group lists after creating a new group
                } else {
                    throw new Error('Failed to create group.');
                }
            } else {
                messageDiv.textContent = 'Group name already exists, please choose another one.';
                messageDiv.style.color = 'red';
            }
        } catch (error) {
            messageDiv.textContent = 'Error: ' + error.message;
            messageDiv.style.color = 'red';
        }
    } else {
        messageDiv.textContent = 'Please enter a group name.';
        messageDiv.style.color = 'red';
    }
});

// Load the groups the user owns and is a member of
async function loadGroups() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/groups/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const { ownedGroups, memberGroups } = await response.json();
        console.log(ownedGroups);
        displayGroups('ownedGroupsList', ownedGroups);
        displayGroups('memberGroupsList', memberGroups);
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}
const socket = io({
    auth: {
        token: localStorage.getItem('token') // Attach token
    }
});
// Connect to Socket.IO server with token authentication

socket.on('connect', () => {
    console.log('Connected to the server');
});
// Display the list of groups
function displayGroups(listId, groups) {
    const listElement = document.getElementById(listId);
    listElement.innerHTML = ''; // Clear existing list

    groups.forEach(group => {
        const li = document.createElement('li');
        li.textContent = group.name;
        li.addEventListener('click', () => openChat(group));
        listElement.appendChild(li);
    });
}

// Open chat for a specific group
async function openChat(group) {
    socket.emit('joinGroup', group.groupId); 
    document.getElementById('groupTitle').textContent = `Chat - ${group.name}`;
    document.getElementById('groupTitle').dataset.groupId = group.groupId; // Set groupId here
    document.getElementById('chatContainer').style.display = 'block'; // Show the chat section
    //loadMessages(group.groupId); // Load messages for the selected group
    // Load intial message of the group
   await loadInitialMessages(group.groupId);
}
 
 if(chatbox){
    

socket.on('receiveGroupMessage', (payload) => {
    console.log('message recieved',payload);
    const messageElement = document.createElement('p');
    messageElement.textContent = `[${new Date(payload.timestamp).toLocaleString()}] ${payload.username}: ${payload.content}`;
    chatbox.appendChild(messageElement);
    
    // Scroll to bottom to see new messages
    chatbox.scrollTop = chatbox.scrollHeight;
});
// Send a new message to the group
document.getElementById('sendBtn').addEventListener('click', async () => {
    const groupId = document.getElementById('groupTitle').dataset.groupId;
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('sendMessage', {
            message,
            groupId: groupId
        });

        // // Render locally after send for immediate feedback
        // const messageElement = document.createElement('p');
        // messageElement.textContent = `[${new Date().toLocaleString()}] You: ${message}`;
        // chatbox.appendChild(messageElement);
        
         messageInput.value = '';  // Clear input
         chatbox.scrollTop = chatbox.scrollHeight;
    }
});
 };




// Infinite scroll: Fetch older messages when user scrolls to top
let isFetching = false; // Prevent multiple fetches at the same time
let lastFetchedMessageId = null; // To track last fetched message for infinite scroll
if(chatbox){
    chatbox.addEventListener('scroll', async () => {
        if (chatbox.scrollTop === 0 && !isFetching) {
            isFetching = true;
    
            const groupId = document.getElementById('groupTitle').dataset.groupId;
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`/api/groups/messages/${groupId}?before=${encodeURIComponent(lastFetchedMessageId || '')}`,
                {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
}

// Load initial messages
async function loadInitialMessages(groupId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/groups/messages/${groupId}`,{
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
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

// Load groups on page load
loadGroups();
