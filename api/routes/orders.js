const express = require('express');
const router = express.Router(); // express router - ships with express - gives us cabibilities to handle different routes, endpoints with differet http verbs
const checkAuth = require('../middleware/check-auth');

const OrdersController = require('../controllers/orders');

router.get('/', checkAuth, OrdersController.orders_get_all); // Dont add () for orders_get_all, just passing it

router.post('/', checkAuth, OrdersController.orders_create_order);

router.get('/:orderId', checkAuth, OrdersController.orders_get_order);

router.delete('/:orderId', checkAuth, OrdersController.orders_delete_order);

module.exports = router; // means router can be exported and used by other files