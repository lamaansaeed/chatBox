const cors = require('cors');
const path = require('path');
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const helmet = require('helmet');
const socketIo = require('socket.io');
const verifyToken = require('./utils/verifyToken');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const sequelize = require('./database/database');
const PORT = process.env.SERVER_PORT || 443; // Use 443 for HTTPS

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: process.env.CLIENT_URL, // e.g. your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Import Models and Associations
const models = {
    GroupUser: require('./models/GroupUser'),
    GroupInvitation: require('./models/GroupInvitation'),
    User: require('./models/User'),
    Message: require('./models/Message'),
    Group: require('./models/Group')
};

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});

// Sync Database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

// Routes
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');

app.use('/', userRoutes);
app.use('/', groupRoutes);
app.use('/', messageRoutes);
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Socket.IO JWT authentication middleware
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Token passed during connection
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    try {
        const user = await verifyToken(token);
        socket.user = user; // Attach the verified user to the socket
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
})
// Socket.IO Events
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    socket.on('sendMessage', async (messageData) => {
        const payload = await Message.create({
            username: socket.user.name,
            content: messageData.message,
            groupId: messageData.groupId,
            userId: socket.user.userId,
            timestamp: new Date(),
        });
        console.log(`Emitting message to group ${messageData.groupId}`, payload);
        if (messageData.groupId) {
           await io.emit('receiveGroupMessage', payload);
            
        } else {
            io.emit('receiveMessage', payload); // Emit to all users for general messages
        }
    });

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.user.name} joined group ${groupId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.name}`);
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});


server.listen(PORT,'0.0.0.0', () => {
    console.log(`Secure server is running on http://localhost:${PORT}`);
});