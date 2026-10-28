const Product = require('../models/Product');

// @desc    Get all products (with optional search, category filter, and price sort)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let queryObject = {};

    // 1. Search filter (case-insensitive regex match on name or description)
    if (search) {
      queryObject.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category filter
    if (category && category !== 'All') {
      queryObject.category = category;
    }

    // Initialize query
    let result = Product.find(queryObject);

    // 3. Sorting by Price
    if (sort) {
      if (sort === 'price_asc') {
        result = result.sort('price'); // sort price low-to-high
      } else if (sort === 'price_desc') {
        result = result.sort('-price'); // sort price high-to-low
      }
    } else {
      result = result.sort('-createdAt'); // default: newest first
    }

    // Execute query
    const products = await result;
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products', error: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    // Handle invalid MongoDB ObjectId format gracefully
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error while fetching product details', error: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock
    });

    const createdProduct = await product.save();
    res.status(201).json({ message: 'Product created successfully', product: createdProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: 'Invalid product data', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category !== undefined ? category : product.category;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error while deleting product', error: error.message });
  }
};
