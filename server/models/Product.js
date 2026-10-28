const mongoose = require('mongoose');

// Define the Product schema
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please enter product category'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please enter product image URL'],
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' // fallback placeholder image
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 10
  }
}, {
  timestamps: true // Tracks when the product was added or modified
});

module.exports = mongoose.model('Product', ProductSchema);
