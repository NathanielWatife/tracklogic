const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email');


const router = expressRouter();
// Admin creates another admin
router.post('/create-admin', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate a secure password for the new admin
        const generatedPassword = uuidv4().slice(0, 8); // Random 8-character password

        // Create the admin account
        const newAdmin = new User({
            name,
            email,
            phone,
            password: generatedPassword,
            role: 'Admin', // Explicitly set the role to Admin
        });

        await newAdmin.save();

        // Send email with the generated password
        const emailBody = `
            <h3>Welcome to TrackLogic!</h3>
            <p>Your admin account has been created successfully. Below are your login details:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${generatedPassword}</p>
            <p>For security purposes, please log in and change your password immediately.</p>
        `;

        try {
            await sendEmail({
                to: email,
                subject: 'Admin Account Created',
                html: emailBody,
            });
            console.log('Email sent to new admin:', email);
        } catch (err) {
            console.error('Error sending email:', err.message);
        }

        res.status(201).json({ message: 'Admin account created successfully' });
    } catch (err) {
        console.error('Error creating admin account:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;