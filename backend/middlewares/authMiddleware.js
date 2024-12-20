import { ChainId, Token, TokenAmount, Pair, Trade, TradeType, Route } from '@uniswap/sdk'
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, resizeBy, next) => {
    const token = req.header('Authoriation')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Unauthorized acces' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });        
    }
};

module.exports = authMiddleware;