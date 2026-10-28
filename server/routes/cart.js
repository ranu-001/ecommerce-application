const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// All cart endpoints require user login
router.use(auth);

// Route to fetch the user's cart
router.get('/', cartController.getCart);

// Route to add product to the cart
router.post('/add', cartController.addToCart);

// Route to remove product from the cart
router.delete('/remove/:id', cartController.removeFromCart);

module.exports = router;
