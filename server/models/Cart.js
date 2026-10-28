const mongoose = require('mongoose');

// Define the Cart Item schema
const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
});

// Define the main Cart schema
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensure each user has only one cart
  },
  items: [CartItemSchema] // Array of cart items
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
