// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
// Controller to fetch all messages
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({ order: [['createdAt', 'ASC']] });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Controller to send a new message
exports.sendMessage = async (req, res) => {
    console.log("posting message")
    const { content } = req.body;
    const user = await User.findOne({where:{userId:req.user.userId}});
    const username = user.name; // Get the username from the decoded token
    console.log(user);
    try {
        const newMessage = await Message.create({ content, username,userId:user.userId });
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
