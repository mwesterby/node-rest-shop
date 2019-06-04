const mongoose = require('mongoose');

const productSchema = mongoose.Schema({ // pass a javascript object to define how the product should look
    _id: mongoose.Schema.Types.ObjectId, // type mongoose uses internally for id's
    name: { type: String, required: true },
    price: { type: Number,  required: true } // dosent mean it's an object - just a more detailed configuration
});

module.exports = mongoose.model('Product', productSchema);