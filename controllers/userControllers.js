const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const logger =require('../logger');
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        console.log('User created:', newUser);
        res.status(201).json({ message: 'Signup successful!', user: newUser,success: true });
    } catch (error) {
        console.log('Error creating user:', error);
        res.status(500).json({ message: 'Signup failed!', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            user.userStatus = 'loggedIn';
            user.save();
            const token = jwt.sign({ userId: user.userId,name:user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Login successful', success: true, token });
        } else {
            return res.status(401).json({ message: 'Invalid credentials', success: false });
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.status(500).json({ message: 'An error occurred', success: false });
    }
};