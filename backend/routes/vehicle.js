const express = require('express');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

// create vehicle 
router.post('/', async (req, res) => {
    const { vehicleType, licensePlate, model, capacity } = req.body;

    try {
        const vehicle = new Vehicle({ vehicleType, licensePlate, model, capacity });
        const savedVehicle = await vehicle.save();
        res.status(201).json(savedVehicle);
    } catch (err) {
        console.error('Error creating vehicle:', err.message);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});


// get all vehicle
router.get('/', async (req, res) => {
    try { 
        const vehicles = await Vehicle.find(); 
        res.json(vehicles);
    } catch (err) {
        console.error('Error fetching vehicles:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});


// update vehicle
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(updatedVehicle);
    } catch (err) {
        console.error('Error updating vehicle:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});
  
// Delete a vehicle
router.delete('/:id', async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});
  
module.exports = router;