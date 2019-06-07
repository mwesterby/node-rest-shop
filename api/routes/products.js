const express = require('express');
const router = express.Router(); // express router - ships with express - gives us cabibilities to handle different routes, endpoints with differet http verbs
const multer = require('multer'); // used for importing of files
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');

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


router.get('/', ProductsController.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, ProductsController.products_update_product);

router.delete('/:productId', checkAuth, ProductsController.products_delete);

module.exports = router; // means router can be exported and used by other files