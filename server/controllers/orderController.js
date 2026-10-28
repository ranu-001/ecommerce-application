const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { customerName, shippingAddress, phoneNumber } = req.body;

    if (!customerName || !shippingAddress || !phoneNumber) {
      return res.status(400).json({ message: 'Please provide name, shipping address, and phone number' });
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty' });
    }

    // 2. Validate stock and structure the order items snapshot
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(404).json({ message: 'One of the products in your cart no longer exists' });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Only ${product.stock} items left.` 
        });
      }

      // Snapshot product price and details
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      // Calculate totals
      totalPrice += product.price * item.quantity;
    }

    // 3. Create the Order
    const order = await Order.create({
      user: req.user.id,
      customerName,
      shippingAddress,
      phoneNumber,
      items: orderItems,
      totalPrice
    });

    // 4. Update products stock inventory
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity } // decrement stock
      });
    }

    // 5. Clear the user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error while placing order', error: error.message });
  }
};

// @desc    Get user orders or all orders (if admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    // If the authenticated user is an admin, fetch ALL orders in the system
    if (req.user.role === 'admin') {
      const orders = await Order.find()
        .populate('user', 'name email') // include buyer name and email
        .sort('-createdAt'); // newest first
      return res.json(orders);
    }

    // If regular user, fetch only their own orders
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status value
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error while updating order status', error: error.message });
  }
};
