const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return reject(new Error('Invalid or expired token'));
            }
            resolve(user);
        });
    });
};

module.exports = verifyToken;
