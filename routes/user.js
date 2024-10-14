const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// Handle signup route
router.post('/signup', userController.signup);

// Handle login route
router.post('/login', userController.login);

module.exports = router;