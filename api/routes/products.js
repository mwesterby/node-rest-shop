const express = require('express');
const router = express.Router(); // express router - ships with express - gives us cabibilities to handle different routes, endpoints with differet http verbs
const mongoose = require('mongoose');
const multer = require('multer'); // used for importing of files
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({  // multer will execute these functions whenever a new file is recieved
    destination: function(req, file, cb) { // where files are stored
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) { // define what the file should be named
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // accept a file
        cb(null, true);
    } else {
        // reject a file
        cb(null, false);
    } 
};

const upload = multer({ // configuration to multer - specifies a folder where multer will try to store all incoming files - this folder isnt publically accessoble by default so will have to be turned into a static folder
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // files upto 5MB
    },
    fileFilter: fileFilter
    }); 
const Product = require('../models/product');

router.get('/', (req, res, next) => { // get is a method that will handle incoming GET requests
    Product.find() // if you dont pass an argument to find, it will find all elements
    .select('name price _id productImage') // list the fields you want to fetch
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    id: doc._id,
                    request: {
                        type: 'GET', // can write however you want - just more information for the user on which URl to use to get more information about this object
                        url: 'http://localhost:3000/products/' + doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => { // you can pass as many arguments (handlers) as you want prior to the function before we handle the incoming request. upload.single() will parse single file - 'productImage' name of the key when sending the form-data
    const product = new Product({
        _id: new mongoose.Types.ObjectId(), // will generate a unique id
        name: req.body.name, // comes from body-parser 
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => { // method provided by mongoose which you can use on mongoose models. Save will store this in the database
            console.log(result);
            res.status(201).json({
                message: 'Creaded product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    id: result._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                },
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
});

router.get('/:productId', (req, res, next) => { // using `:` followed by any variable name of your choice
    const id = req.params.productId; // extract the id
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) { // i.e. if the doc is there
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all products', // do create descripting APIs if you're planning on using them publicly
                    url: 'http://localhost:3000/products'
                }
            });
        } else {
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error: err}) // 500 status as soemthing failed while fetching the data
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => { // using `:` followed by any variable name of your choice
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    } 
    Product.updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => { // using `:` followed by any variable name of your choice
    const id = req.params.productId;
    Product.deleteOne({_id: id}) // i.e. remove any objects in the database whose `_id` matches local `id` variable
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: { name: 'String', price: 'Number' }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router; // means router can be exported and used by other files