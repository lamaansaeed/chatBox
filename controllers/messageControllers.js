// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize'); // Import Op from Sequelize
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

//Controller to logout
exports.logOut = async (req,res) =>{
    console.log('logging out ');
    const {userStatus} = req.body;
    try{
        const user = await User.findOne({where:{userId : req.user.userId}});
        user.userStatus = 'loggedOut';
        user.save();
        res.status(201).json(user);
    } catch (error) {
        console.log('failed to logout:',error);
        res.status(500).json({error: 'failed to logout'})    }

}
exports.searchUser = async (req, res) => {
    const query = req.query.query;
    try {
        const users = await User.findAll({
            where: {
                name: {
                    [Op.like]: `%${query}%`
                }
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};