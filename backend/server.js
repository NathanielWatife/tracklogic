require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const socketIo = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const Package = require('./models/Package'); 

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const packageRoutes = require('./routes/package');
const driverRoutes = require('./routes/driver');
const vehicleRoutes = require('./routes/vehicle');
const paymentRoutes = require('./routes/payment');

// Initialize Express app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());



mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to mongodb successfully'))
    .catch((err => console.error(err)));

// Real-time location tracking
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('authenticate', async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('User authenticated:', decoded);
            socket.user = decoded;
            socket.emit('authenticated', { message: 'Authentication successful' });
        } catch (err) {
            console.error('Authentication error:', err.message);
            socket.emit('unauthorized', { message: 'Authentication failed' });
            socket.disconnect(true);
        }
    });

    socket.on('updateLocation', async ({ packageId, latitude, longitude }) => {
        try {
            const updatedPackage = await Package.findOneAndUpdate(
                { packageId },
                { $set: { currentLocation: { latitude, longitude, timestamp: new Date() } } },
                { new: true }
            );

            if (updatedPackage) {
                io.emit('locationUpdated', { packageId, currentLocation: updatedPackage.currentLocation });
            } else {
                console.error(`Package with ID ${packageId} not found`);
            }
        } catch (err) {
            console.error('Error updating location:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});

// Routes
app.get('/', (req, res) => res.send('API is running...'));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payment', paymentRoutes);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
