const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    vehicleType: {
        type: String,
        enum: ['Bike', 'Car', 'Van', 'MiniVan'],
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    model: {
        type: String, 
        required: true
    },
    capacity: {
        type: Number,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);