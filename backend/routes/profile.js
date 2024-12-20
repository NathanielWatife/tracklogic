const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// route for profile
// private access only
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await Uer.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// routes to update user profile
router.put('/', 
    [
        authMiddleware,
        body('name').optional().notEmpty().withMessage('Name is required'),
        body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
        body('profilePicture').optional().isURL().withMessage('Invalid Profile Picture'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, phone, profilePicture  } = req.body;
            // we build an object to of fields to update
            const updateFields = {};
            if (name) updateFields.name = name;
            if (phone) updateFields.phone = phone;
            if (profilePicture) updateFields.profilePicture = profilePicture;

            const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
            if (!user) return res.status(404).json({ message: 'User not found' });

            res.json(user);
        } catch (err){
            console.error('Error updating profile:', err.message);
            res.status(500).json({ message: 'Server Error' });
        }
    }
);

module.exports = router;