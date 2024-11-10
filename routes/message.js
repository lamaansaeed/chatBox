// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageControllers');
const authenticateToken = require('../middelware/authMiddleware');

// Route to fetch all messages (no authentication needed)
router.get('/api/messages', messageController.getAllMessages);

// Route to send a new message (authentication required)
router.post('/api/messages', authenticateToken, messageController.sendMessage);

router.put('/logout',authenticateToken,messageController.logOut);

router.get('/api/users/search', authenticateToken,messageController.searchUser);
module.exports = router;
