const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, admin } = require('../middleware/auth');

// Public route to get all products
router.get('/', productController.getProducts);

// Public route to get a single product by ID
router.get('/:id', productController.getProductById);

// Admin route to create a product
router.post('/', auth, admin, productController.createProduct);

// Admin route to update a product by ID
router.put('/:id', auth, admin, productController.updateProduct);

// Admin route to delete a product by ID
router.delete('/:id', auth, admin, productController.deleteProduct);

module.exports = router;
