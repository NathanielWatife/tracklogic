const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();
const app = express();

// use middleware
app.use(express.json());
app.use(cors());
app.use(helmet());


// load nv variable
const MONGO_URI = process.env.MONGO_URI;

const PORT = process.env.PORT;

// connect to mongodb
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})  .then(() => console.log('Connected to mongodb successfuly'))
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// setting up routes
app.get('/', (req, res) => res.send('API is running...'));

// start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})