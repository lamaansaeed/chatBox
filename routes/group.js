// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupControllers');
const authenticateToken = require('../middelware/authMiddleware');

// Route for checking if the group name is unique
router.post('/api/groups/check', authenticateToken, groupController.checkGroupName);

// Route for creating a new group
router.post('/api/groups/create', authenticateToken, groupController.createGroup);

// Fetch groups the user owns and is a member of
router.get('/api/groups/list', authenticateToken, groupController.fetchGroup);

// Fetch recent messages for a group
router.get('/api/groups/messages/:groupId', authenticateToken, groupController.fetchGroupMessage);

// Send a message to a group
router.post('/api/groups/messages/:groupId', authenticateToken,groupController.sendGroupMessage);
// get the groups the is owned by you 
router.get('/api/groups',authenticateToken,groupController.getUserGroups);
// get the groups of the other user 
router.get('/api/usergroups', authenticateToken,groupController.getGroupsOfuser);

router.post('/api/group-users/invite',authenticateToken,groupController.inviteUser);               

//fetch sent invitation
router.get('/api/invitations/sent', authenticateToken, groupController.fetchSentInvitaions);

//fetch recieved invitations
router.get('/api/invitations/received',authenticateToken,groupController.fetchRecievedInvitations);

//Reject invitations
router.delete('/api/invitations/cancel/:inviteId',authenticateToken,groupController.cancleInvitation);
//accept Invitations
router.put('/api/invitations/accept/:inviteId',authenticateToken,groupController.acceptInvitation);
module.exports = router;
