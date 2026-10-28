require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // allows express to parse JSON bodies

// Serve static frontend files from the "client" folder
app.use(express.static(path.join(__dirname, '../client')));

// Connect to MongoDB Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce-db';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Database');
    
    // Seed initial products if database is empty
    await seedInitialProducts();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Seed Data Function (helps beginners see products right away)
const seedInitialProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Product collection is empty. Seeding initial products...');
      const dummyProducts = [
        {
          name: "Premium Wireless Headphones",
          description: "High-quality wireless headphones with active noise cancellation, deep bass, and up to 30 hours of battery life.",
          price: 99.99,
          category: "Electronics",
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
          stock: 15
        },
        {
          name: "Minimalist Leather Watch",
          description: "Classic design watch with a genuine brown leather strap, water-resistant casing, and elegant steel dial.",
          price: 149.50,
          category: "Accessories",
          imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
          stock: 8
        },
        {
          name: "Casual Running Sneakers",
          description: "Lightweight and breathable athletic shoes featuring responsive cushioning, perfect for running and daily wear.",
          price: 79.99,
          category: "Footwear",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
          stock: 25
        },
        {
          name: "Ergonomic Office Chair",
          description: "Comfortable mesh office chair with adjustable lumbar support, armrests, and height adjustment for study or work.",
          price: 199.00,
          category: "Furniture",
          imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500",
          stock: 5
        },
        {
          name: "Stainless Steel Water Bottle",
          description: "Double-walled vacuum insulated flask that keeps drinks ice cold for 24 hours or hot for 12 hours.",
          price: 24.99,
          category: "Home & Kitchen",
          imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
          stock: 50
        },
        {
          name: "Smart Fitness Tracker",
          description: "Waterproof fitness band tracking heart rate, sleep, steps, and sports activities with an OLED touch screen.",
          price: 49.95,
          category: "Electronics",
          imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500",
          stock: 12
        }
      ];

      await Product.insertMany(dummyProducts);
      console.log('Dummy products seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Mount API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Fallback: Serve index.html for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open in browser: http://localhost:${PORT}`);
});
