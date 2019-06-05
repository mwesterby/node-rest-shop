const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({ // pass a javascript object to define how the order should look
    _id: mongoose.Schema.Types.ObjectId, // type mongoose uses internally for id's
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // you need to use ref to configure a type - we assign it the name of the model you want to reference
    quantity: { type: Number, default: 1 } // will always store at least 1 in the database for quantity value
});

module.exports = mongoose.model('Order', orderSchema);