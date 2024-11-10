document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('viewedUser'));  // Get the selected user from localStorage

    if (!user) {
        alert('No user selected');
        return;
    }

    // Display user details
    document.getElementById('username').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;

    // Event listener for "Message" button
    document.getElementById('messageBtn').addEventListener('click', () => {
        // Implement message functionality (e.g., open a chat window or send a message)
        alert(`Start messaging ${user.name}`);
    });

    // Event listener for "Show Groups" button
    document.getElementById('showGroupsBtn').addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/groups/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }

            const groups = await response.json();
            const groupList = document.getElementById('groupList');
            groupList.innerHTML = '';  // Clear any existing groups

            groups.forEach(group => {
                const groupElement = document.createElement('li');
                groupElement.textContent = group.name;

                // Create Invite button
                const inviteBtn = document.createElement('button');
                inviteBtn.textContent = 'Invite';
                inviteBtn.addEventListener('click', async () => {
                    // Send invite request to the server
                    await inviteUserToGroup(group.groupId);
                });

                groupElement.appendChild(inviteBtn);
                groupList.appendChild(groupElement);
            });

            document.getElementById('groupsSection').style.display = 'block';  // Show the groups section
        } catch (error) {
            console.error(error);
        }
    });
    document.getElementById('showUserGroup').addEventListener('click', async ()=>{
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('viewedUser'))
        try{
            const response = await fetch(`/api/usergroups?userId=${user.userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch groups');
            }
            const groups = await response.json();

            const groupList = document.getElementById('userGroupList');
            groupList.innerHTML = '';  // Clear any existing groups

            groups.forEach(group => {
                const groupElement = document.createElement('li');
                groupElement.textContent = group.name;

                // Create Invite button
                const inviteBtn = document.createElement('button');
                inviteBtn.textContent = 'request';
                inviteBtn.addEventListener('click', async () => {
                    // Send invite request to the server
                    await requestForGroup(group.groupId);
                });

                groupElement.appendChild(inviteBtn);
                groupList.appendChild(groupElement);
                document.getElementById('userGroupSection').style.display = 'block'; 
            });
        }catch(error){
            console.log(error);
        }
    })
    async function inviteUserToGroup(groupId) {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('viewedUser'))
        try {
            const response = await fetch('/api/group-users/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ groupId, userId: user.userId, role: 'inprocess' })
            });

            if (!response.ok) {
                throw new Error('Failed to invite user');
            }

            alert(`Invite sent to ${user.name}`);
        } catch (error) {
            console.error('Error inviting user:', error);
        }
    }
});
