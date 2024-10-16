const cors = require('cors');
const path = require('path');
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = express();
const dotenv = require('dotenv')
dotenv.config();
const sequelize = require('./database/database');
const helmet = require('helmet');
console.log(process.env.SERVER_PORT);
const PORT = process.env.SERVER_PORT ||443; // Use 443 for HTTPS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
app.use('/', userRoutes);
app.use('/api/messages', messageRoutes);
app.listen(PORT,'0.0.0.0', () => {
    console.log(`Secure server is running on https://localhost:${PORT}`);
});