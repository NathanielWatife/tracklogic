const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// const for auth
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const packageRoutes = require('./routes/package');


const app = express();

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

// setting up routes
app.get('/', (req, res) => res.send('API is running...'));
// routes for register
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/packages', packageRoutes);

// start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));