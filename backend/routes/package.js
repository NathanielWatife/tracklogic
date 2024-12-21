const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const Package = require('../models/Package');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const nodemailer = require('nodemailer');


const router = express.Router();

// emai transport
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


router.post(
    '/',
    [
      authMiddleware,
      body('weight').isNumeric().withMessage('Weight must be a number'),
      body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('transitType').isIn(['Bike', 'Car', 'Van', 'MiniVan']).withMessage('Invalid transit type'),
      body('deliveryType').isIn(['PickupStation', 'DoorDelivery']).withMessage('Invalid delivery type'),
      body('price').isNumeric().withMessage('Price must be a number'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        // Create a new package object
        const { weight, quantity, dimensions, transitType, deliveryType, deliveryAddress, price } = req.body;
  
        const newPackage = new Package({
          packageId: uuidv4(), // Generate a unique package ID
          userId: req.user.id,
          weight,
          quantity,
          dimensions,
          transitType,
          deliveryType,
          deliveryAddress,
          price,
        });
  
        // Save the package to the database
        const savedPackage = await newPackage.save();
  
        // Fetch user details after saving the package
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        const userEmail = user.email;
  
        // Send email with package details
        const emailBody = `
          <h3>Package Details</h3>
          <p><strong>Package ID:</strong> ${savedPackage.packageId}</p>
          <p><strong>Weight:</strong> ${savedPackage.weight} kg</p>
          <p><strong>Quantity:</strong> ${savedPackage.quantity}</p>
          <p><strong>Transit Type:</strong> ${savedPackage.transitType}</p>
          <p><strong>Delivery Type:</strong> ${savedPackage.deliveryType}</p>
          ${
            savedPackage.deliveryType === 'DoorDelivery'
              ? `<p><strong>Delivery Address:</strong> ${savedPackage.deliveryAddress.street}, ${savedPackage.deliveryAddress.city}, ${savedPackage.deliveryAddress.state}, ${savedPackage.deliveryAddress.zipCode}</p>`
              : ''
          }
          <p><strong>Price:</strong> $${savedPackage.price}</p>
          <p><strong>Status:</strong> ${savedPackage.status}</p>
          <p>Thank you for choosing our service!</p>
        `;
  
        try {
          await transporter.sendMail({
            from: process.env.EMAIL,
            to: userEmail,
            subject: 'Your Package Details',
            html: emailBody,
          });
          console.log('Email sent successfully to', userEmail);
        } catch (emailError) {
          console.error('Error sending email:', emailError.message);
        }
  
        // Respond with the saved package
        res.status(201).json(savedPackage);
      } catch (err) {
        console.error('Error creating package:', err.message);
        res.status(500).json({ message: 'Server Error' });
      }
    }
  );
  


// routes to get packages
router.get('/', authMiddleware, async (req, res) => {
    try {
        const packages = await Package.find({ userId: req.user.id });
        res.json(packages);
    } catch (err) {
        console.error('Error fetching packages:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});


// get packages by id
router.get('/:id', async (req, res) => {
    try {
        const pacakge = await Package.findOne({ packageId: req.params.id, userId: req.user.id });
        if (!package) {
            return res.status(404).json({ message: 'Package not foind' });
        }
        res.json(package);
    } catch (err) {
        console.error('Error fetching package:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});


// update a package using it is ID
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        const updatedPackage = await Package.findOneAndAupdate(
            { packageId: req.params.id, userId: req.user.id },
            updates,
            { new:true }
        );
        if (!updatePackage) {
            return res.status(404).json({ message: 'Package not found' });
        } 
        res.json(upadtePackage);
    } catch (err) {
        console.error('Error updating package:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});


// delete a package using its ID
router.delete('/:id', authMiddleware, async (re, res) => {
    try {
        const package = await Package.findOneAndDelete({ packageId: req.params.id, userId: req.user.id });
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        console.error('Error deleting packages: ', err.mesage );
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
