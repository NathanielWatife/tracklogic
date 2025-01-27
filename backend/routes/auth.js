const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
    logger: true
});

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '5h' } // Fixed expiration format
    );
};

// Register route
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Invalid email'),
        body('phone').isMobilePhone().withMessage('Invalid phone number'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'User already exists' });

            user = new User({ name, email, phone, password });
            await user.save();

            // Send verification email
            const verificationToken = generateToken(user);
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;

            try {
                await transporter.sendMail({
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Verify your email',
                    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
                });
            } catch (emailErr) {
                console.error('Email Sending Error:', emailErr.message);
                return res.status(500).json({ message: 'Failed to send verification email' });
            }

            res.status(201).json({ message: 'User registered. Verification email sent.' });
        } catch (err) {
            console.error('Error:', err);
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
);

// Email verification route
router.get('/verify-email', async (req, res) => {
    const { token } = req.query; // Get the token from the query string
    if (!token) {
        return res.status(400).send('<h3>Invalid or missing token. Verification failed.</h3>');
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user and mark their email as verified
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).send('<h3>User not found. Verification failed.</h3>');
        }

        user.isEmailVerified = true;
        await user.save();

        // Redirect to the login page
        return res.redirect('/login.html');
    } catch (err) {
        console.error('Error verifying email:', err.message);
        res.status(400).send('<h3>Invalid or expired token. Verification failed.</h3>');
    }
});

// Login route
router.post(
    '/login',
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
            console.error('Login Error:', err);
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
);

module.exports = router;
