// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageControllers');
const authenticateToken = require('../middelware/authMiddleware');

// Route to fetch all messages (no authentication needed)
router.get('/', messageController.getAllMessages);

// Route to send a new message (authentication required)
router.post('/', authenticateToken, messageController.sendMessage);

module.exports = router;
