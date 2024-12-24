const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    packageId: {type: String, unique: true, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    weight: { type: Number, required: true },
    quantity: {type: Number, required: true },
    dimensions: { type: String },
    transitType: { type: String, enum : ['Bike', 'Car', 'Van', 'MiniVan'], required: true },
    deliveryType: { type: String, enum : ['PickupStation', 'DoorDelivery'], required: true },
    deliveryAddress: { street: String, city: String, state: String, zipCode: String, landmark: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'In-Transit', 'Delivered'], default: 'Pending',},
    currentLocation: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, reuired: false },
        timstamp: { type: Date, default: Date.now },
    },
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Package', PackageSchema);