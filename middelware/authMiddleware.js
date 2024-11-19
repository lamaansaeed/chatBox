const verifyToken = require('../utils/verifyToken');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    try {
        const user = await verifyToken(token);
        req.user = user;
        next();
    } catch (err) {
        return res.sendStatus(403); // Forbidden
    }
};

module.exports = authenticateToken;
