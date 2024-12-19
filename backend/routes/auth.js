import { ChainId, Token, TokenAmount, Pair, Trade, TradeType, Route } from '@uniswap/sdk'
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');


const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
});

// generate jwt token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {expiresIn: '1hr'}
    );
};

// routes fr register
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('phone').isMobilePhone().withMessage('Invalid phone number'),
    body('password').isLenght({ min: 6 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {  name, email, phone, password } = req.body;
    try {
        let user = await User.findOne({email}); 
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, phone, password });
        await user.save();

        // send verification email
        const verificationToken = generateToken(user);
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.Email,
            to: email,
            subject: 'Verify your email',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        });
        res.status(201).json({message: 'User register. Verification email sent.'});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
}
);

// get routes to verify email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is missing' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isEmailVerified = true;
        await user.save();

        res.json({ message: 'Email verified successfully.' });
    } catch (err) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});



// routes for login
routes.post('/login', 
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'Invalid credentials' });

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            if (!user.isEmailVerified) {
                return res.status(403).json({ message: 'Please verify your email to login' });
            }
            const token = generateToken(user);
            res.json({ token });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

module.exports = router;