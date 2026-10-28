const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get or create cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    
    // Populate the product details (name, price, imageUrl, stock) for each cart item
    await cart.populate('items.product', 'name price imageUrl stock');
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error while fetching cart', error: error.message });
  }
};

// @desc    Add product to cart (or increment quantity if already exists)
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    // Validate product existence and stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if the product is already in the user's cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product already in cart: check new quantity
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty <= 0) {
        // Remove item if quantity drops to 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
    } else {
      // Product not in cart: add new item (only if quantity is positive)
      if (qty > 0) {
        cart.items.push({ product: productId, quantity: qty });
      } else {
        return res.status(400).json({ message: 'Quantity must be positive for new items' });
      }
    }

    await cart.save();
    
    // Populate product details before returning
    await cart.populate('items.product', 'name price imageUrl stock');
    res.json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error while adding to cart', error: error.message });
  }
};

// @desc    Remove product from cart (completely remove or decrement)
// @route   DELETE /api/cart/remove/:id
// @access  Private
// (Note: we treat :id as the Product ID to remove)
exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Filter out the item with the matching product ID
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl stock');
    
    res.json({ message: 'Product removed from cart successfully', cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error while removing from cart', error: error.message });
  }
};
