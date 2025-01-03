const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    packageId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weight: { type: Number, required: true },
    quantity: { type: Number, required: true },
    dimensions: { type: String },
    transitType: { type: String, enum: ['Bike', 'Car', 'Van', 'MiniVan'], required: true },
    deliveryType: { type: String, enum: ['PickupStation', 'DoorDelivery'], required: true },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        landmark: String,
    },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'In Transit', 'Delivered'], default: 'Pending' },
    currentLocation: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
        timestamp: { type: Date, default: Date.now },
    },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    payment: {
        status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
        method: { type: String, enum: ['BankTransfer', 'USSD', 'Paystack'], required: false },
        transactionId: { type: String, required: false },
        amount: { type: Number, required: false },
        reference: { type: String, required: false },
        currency: { type: String, default: 'NGN' }, // Default to Naira
        paymentDate: { type: Date, required: false },
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Package', PackageSchema);
