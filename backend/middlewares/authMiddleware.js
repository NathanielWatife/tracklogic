const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message:'Unauthorized access: No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user  = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized access: User not found' });
        }
        req.user = user; // attaching user to request
        next();
    } catch (err) {
        console.error('AuthMiddleware Error:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};


// check if user is an admin 
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized access: Only admins can access this route' });
    }
}

module.exports = {authMiddleware, adminMiddleware};