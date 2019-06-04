const express = require('express');
const app = express(); // executes express like a function
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.connect(
    'mongodb+srv://admin:' +
        process.env.MONGO_ATLAS_PW +
        '@node-rest-shop-bzlog.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true
        // useMongoClient: true
    }        
);

mongoose.Promise = global.Promise; // uses the node.js promise implementation (helps with deprecation warnings)

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false})); // extended false - only support simple bodies for URL encoded data
app.use(bodyParser.json());

// Adds headers to response to prevent CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // star gives access to any origin
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') { // A browser will always send an options request first before a POST or PUT request
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({}); // Return as the options request doesnt need to go to the routes
    }
    next(); // always make sure to add next as to not block the incoming requests so that the other routes can take over
});

// Routes wich should handle requests
app.use('/products', productRoutes); // `use()` sets up a middleware - so an incoming request has to go though app.use and to whatever we pass to it. Anything starting with `/produts` in the URL will be forwarded to api/routes/products.js
app.use('/orders', orderRoutes);

// If we get to this point, not of the routers whcih were set up were able to handle the request
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// Should be able to handle errors anywhere in the application
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;