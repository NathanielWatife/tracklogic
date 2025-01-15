const express = require('express');
const mongoose = require('mongoose');
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


router.post('/',
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


// Update a package
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { driverId, vehicleId, ...otherUpdates } = req.body;

    const updates = {
      ...otherUpdates,
      ...(driverId && { driverId: new mongoose.Types.ObjectId(driverId) }),
      ...(vehicleId && { vehicleId: new mongoose.Types.ObjectId(vehicleId) }),
    };

    const updatedPackage = await Package.findOneAndUpdate(
      { packageId: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json(updatedPackage);
  } catch (err) {
    console.error('Error updating package:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
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



// update delivery details
router.put('/:id/delivery', authMiddleware, async (req, res) => {
  try {
    const { deliveryType, deliveryAddress } = req.body;
    const updateFields = {};
    if (deliveryType) updateFields.deliveryType = deliveryType;
    if (deliveryAddress) updateFields.deliveryAddress = deliveryAddress;

    const updatedPackage = await Package.findOneAndUpdate(
      { packageId: req.params.id, userId: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // fetch the user email
    const emailBody = `
    <h3>Package Delivery Details Updated</h3>
    <p>Your package with ID <strong>${updatedPackage.packageId}</strong> has been updated.</p>
    <p><strong>New Delivery Type:</strong> ${updatedPackage.deliveryType}</p>
    ${
      updatedPackage.deliveryAddress
        ? `<p><strong>New Delivery Address:</strong> ${updatedPackage.deliveryAddress.street}, ${updatedPackage.deliveryAddress.city}, ${updatedPackage.deliveryAddress.state}, ${updatedPackage.deliveryAddress.zipCode}</p>`
        : ''
    }
    <p>Thank you for choosing our service!</p>
  `;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Package Delivery Details Updated',
      html: emailBody
    });
    console.log('Email sent successfully to', userEmail);
  } catch (emailError) {
    console.error('Error sending email:', emailError.message);
  }
    res.json(updatedPackage);
  } catch (err) {
    console.error('Erro updating delivery details:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


// package update deliveery status
router.put('/:id/status', authMiddleware, async (req, res) =>{
  try {
    const { status } = req.body;
    console.log('Request Body:', req.body);
    console.log('Package ID:', req.params.id);
    console.log('Authenticated User ID:', req.user.id);

    if (!['Pending', 'In-Transit', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invali status' });
    }
    const updatePackage = await Package.findOneAndUpdate(
      { packageId: req.params.id, userId: req.userId },
      { $set: { status } },
      { new: true }
    );
    if (!updatePackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // fetch user email
    const user = await User.findById(req.user.id);
    const userEmail = user.email;
    // email notifcation
    const emailBody = `
      <h3>Package Status Updated</h3>
      <p>Your package with ID <strong>${updatedPackage.packageId}</strong> has a new status.</p>
      <p><strong>New Status:</strong> ${updatedPackage.status}</p>
      <p>Thank you for choosing our service!</p>
    `;
    try {
      await transporter.sendMail({
        from: process.env.Email,
        to: userEmail,
        subject: 'Package Status Updated',
        html: emailBody
      });
      console.log('Email sent successfully', userEmail);
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
    }
    console.log('Updated Package:', updatedPackage);
    res.json(updatePackage);
  } catch (err) {
    console.error('Error updating delivery status:', err.message);
    res.status(500).json({ mssage: 'Server Error' });
  }
});



router.put('/:id/assign', authMiddleware, async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;

    if (!driverId || vehicleId ) {
      return res.status(400).json({ message: 'Driver ID and Vehicle ID are required' });
    }
    const updatedPackage = await Package.findByIdAndUpdate(
      { packageId: req.params.id, userId: req.user.id },
      {
        $set: { driverId, vehicleId },
      },
      { new: true }
    );
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({
      message: 'Driver and vehicle assigned successfully', 
      package: updatedPackage,
    });
  } catch (err) {
    console.error('Error assigning driver and vehicle:', err.message);
    res.status(500).json({ message: 'Server Error', error: err.message })
  };

  
});



module.exports = router;