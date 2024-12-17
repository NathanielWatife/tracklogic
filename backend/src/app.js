// define required constant
const express = requie('express');
const dotenv  = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');


// env variables
dotenv.config();

const app = express();

// include middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extends: true}));


// routes 
app.use('/api', routes);

// error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.stack || 500).json({ error: "message || 'Internal Server Error" });
});

module.exports = app;
