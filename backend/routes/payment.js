const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const Package = require('../models/Package');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Paystack Payment Initialization
router.post('/paystack/:packageId', authMiddleware, async (req, res) => {
    try {
        const package = await Package.findOne({ packageId: req.params.packageId, userId: req.user.id });
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: req.user.email,
                amount: package.price * 100, // Convert to Kobo
                reference: package.packageId, // Unique reference ID
                callback_url: 'http://localhost:5000/api/payment/paystack/callback',
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                },
            }
        );

        res.json({
            message: 'Paystack payment initialized',
            authorization_url: paystackResponse.data.data.authorization_url,
        });
    } catch (err) {
        console.error('Error initializing Paystack payment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Paystack Callback
router.post('/paystack/callback', async (req, res) => {
    try {
        const { reference } = req.body;

        // Verify transaction with Paystack
        const verifyResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });

        const data = verifyResponse.data.data;
        if (data.status === 'success') {
            // Update payment status in database
            const package = await Package.findOneAndUpdate(
                { packageId: reference },
                { $set: { 'payment.status': 'Paid', 'payment.paymentDate': new Date() } },
                { new: true }
            );

            if (package) {
                console.log('Payment verified and updated for package:', package.packageId);
                return res.json({ message: 'Payment verified successfully' });
            }

            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(400).json({ message: 'Payment verification failed' });
    } catch (err) {
        console.error('Error verifying payment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Initiate Payment
router.post('/initiate/:packageId', authMiddleware, async (req, res) => {
    const { method } = req.body;

    if (!['BankTransfer', 'USSD', 'Paystack'].includes(method)) {
        return res.status(400).json({ message: 'Invalid payment method' });
    }

    try {
        const package = await Package.findOne({ packageId: req.params.packageId, userId: req.user.id });
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const transactionId = uuidv4(); // Generate unique transaction ID
        package.payment.method = method;
        package.payment.transactionId = transactionId;
        package.payment.status = 'Pending';
        package.payment.timestamp = new Date();
        await package.save();

        res.json({
            message: 'Payment initiated successfully',
            paymentDetails: {
                method,
                transactionId,
                status: package.payment.status,
            },
        });
    } catch (err) {
        console.error('Error initiating payment:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Payment Status
router.put('/status/:packageId', authMiddleware, async (req, res) => {
    const { status, transactionId } = req.body;

    if (!['Pending', 'Paid', 'Failed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' });
    }

    try {
        const package = await Package.findOne({ packageId: req.params.packageId, userId: req.user.id });
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        if (transactionId && package.payment.transactionId !== transactionId) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        package.payment.status = status;
        await package.save();

        res.json({
            message: 'Payment updated successfully',
            paymentDetails: {
                status: package.payment.status,
                method: package.payment.method,
                transactionId: package.payment.transactionId,
            },
        });
    } catch (err) {
        console.error('Error updating payment status:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
