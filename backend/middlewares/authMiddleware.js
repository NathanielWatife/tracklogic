const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, resizeBy, next) => {
    const token = req.header('Authoriation')?.replace('Bearer ', '');
    if (!token) return res.status(404).json({ message: 'Unauthorized access' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(404).json({ message: 'User not found' });
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });        
    }
};

module.exports = authMiddleware;