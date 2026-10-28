const mongoose = require('mongoose');

// Define the Order Item schema (saves a snapshot of the product details at purchase time)
const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

// Define the main Order schema
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: [true, 'Please enter customer name']
  },
  shippingAddress: {
    type: String,
    required: [true, 'Please enter shipping address']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please enter phone number']
  },
  items: [OrderItemSchema], // List of items purchased
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
