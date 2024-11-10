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
    document.getElementById('groupTitle').textContent = `Chat - ${group.name}`;
    document.getElementById('chatContainer').style.display = 'block'; // Show the chat section
    loadMessages(group.groupId); // Load messages for the selected group
}

// Fetch and display the last 10 messages for a group
async function loadMessages(groupId) {
    const token = localStorage.getItem('token');
    const chatbox = document.getElementById('chatbox');

    try {
        const response = await fetch(`/api/groups/messages/${groupId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const messages = await response.json();
        chatbox.innerHTML = ''; // Clear chatbox

        messages.forEach(msg => {
            const messageElement = document.createElement('p');
            messageElement.textContent = `[${msg.timestamp}] ${msg.username}: ${msg.content}`;
            chatbox.appendChild(messageElement);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Send a new message to the group
document.getElementById('sendBtn').addEventListener('click', async () => {
    const message = document.getElementById('messageInput').value.trim();
    const token = localStorage.getItem('token');
    const groupId = document.getElementById('groupTitle').dataset.groupId;

    if (message !== '') {
        try {
            await fetch(`/api/groups/messages/${groupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: message })
            });
            
            document.getElementById('messageInput').value = ''; // Clear input field
            loadMessages(groupId); // Reload messages
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
});

// Load groups on page load
loadGroups();
