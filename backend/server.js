const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const socketIo = require('socket.io');
const http = require('http');

// const for auth
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const packageRoutes = require('./routes/package');
const driverRoutes = require('./routes/driver');
const vehicleRoutes = require('./routes/vehicle')
const paymentRoutes = require('./routes/payment');


// initialize the app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// use middleware
app.use(express.json());
app.use(cors());
app.use(helmet());


// load nv variable
const MONGO_URI = process.env.MONGO_URI;

const PORT = process.env.PORT;

// connect to mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to mongodb successfully'))
    .catch((err => console.error(err)));


// real time geolocation tracking
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    // we authenticate the user on connection
    socket.on('authenticate', async(token) => {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log('USer authnticated:', decoded);
            // attach the user information to the socket or later use
            socket.user=decoded;
            // confirm authentication success
            socket.emit('authenticated', { message: 'Authentication successsful' });
        } catch(err) {
            console.error('Authentication error:', err.message);
            // emit an error then disconnect the socket
            socket.emit('unauthorized', { messagE: 'Authentication failed' });
            socket.disconnect(true);
        }
    });

    // listen for location updates
    socket.on('updateLocation', async ({ packageId, latitude, longitude }) => {
        console.log(`Location update for package ${packageId}: (${latitude}, ${longitude})`);
        // update location of package in database
        try {
            const updatePackage = await Package.findOneAndUpdate(
                {packageId},
                { $set: { currentLocation: { latitude, longitude, timestamp: new Date() } } },
                { new: true }
            );

            if (updatePackage) {
                // we broadcast the update of location of clients
                io.emit('locationUpdated', {
                    packageId,
                    currentLocation: updatedPackage.currentLocation,
                });
            } else {
                console.error(`Packagewith ID ${packageId} not found`);
            }
        } catch(err) {
            console.error('Error updating location;', err.message);
        }
    });

    // we handle the disconnection
    socket.on('disconnect', () => {
        consol.log('A client is disconnected:', socket.id);
    });
});



// setting up routes
app.get('/', (req, res) => res.send('API is running...'));
// routes for register
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payment', paymentRoutes);


// start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));