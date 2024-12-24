const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Token: ', token);

        if (!token) {
            return res.status(401).json({ message:'Unauthorized access: No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);

        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized access: User not found' });
        }

        next();
    } catch (err) {
        console.error('AuthMiddleware Error:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;