const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');

// All order endpoints require user login
router.use(auth);

// Route to place a new order
router.post('/', orderController.createOrder);

// Route to view order history (user sees their own; admin sees all)
router.get('/', orderController.getOrders);

// Route to update order status (admin only)
router.put('/:id', admin, orderController.updateOrderStatus);

module.exports = router;
