const express = require('express');
const Driver = require('../models/Driver');

const router = express.Router();


// create a driver
router.post('/', async (req, res) => {
    const { name, phone, email, licenseNumber } = req.body;

    try {
        const driver = new Driver({ name, phone, email, licenseNumber });
        const savedDriver = await driver.save();
        res.status(201).json(savedDriver);
    } catch (err){
        console.error('Error creating Driver:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// get all drivers
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (err){
        console.error('Error fetching drivers:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// update driver
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updateDriver = await Driver.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updateDriver) return res.status(404).json({ message: 'Driver not found' });
        res.json(updateDriver);
    } catch (err) {
        console.error('Error updating Driver:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});


// delete driver
router.delete('/:id', async (req, res) => {
    try {
        const deleteDriver = await Driver.findByIdAndDelete(req.param.id);
        if (!deleteDriver) return res.status(404).json({ message: 'Driver not foumd' });
        res.json({ message: 'Server Error' });
    }  catch (err) {
        console.error('Error deleting driver:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;