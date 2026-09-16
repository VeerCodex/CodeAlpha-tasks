const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./database/db');
const { requireAuth, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'CodeAlpha Full Stack Internship — Task 1: E-Commerce Store',
    developer: 'Veernarayan',
    timestamp: new Date().toISOString()
  });
});

// Categories endpoint
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Products listing with filters
app.get('/api/products', (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, inStock } = req.query;
    const products = db.getProducts({ category, search, minPrice, maxPrice, sort, inStock });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Single product details
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit a product review
app.post('/api/products/:id/reviews', optionalAuth, (req, res) => {
  try {
    const { rating, comment, user } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    const reviewerName = req.user ? req.user.name : (user || 'Verified Buyer');
    const updatedProduct = db.addProductReview(req.params.id, {
      rating,
      comment,
      user: reviewerName
    });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Review posted successfully!',
      product: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({ name, email, passwordHash });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Current User Profile
app.get('/api/auth/profile', requireAuth, (req, res) => {
  try {
    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = db.getOrdersByUserId(user.id);
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt
      },
      stats: {
        orderCount: orders.length,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Coupon validation
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
  }

  const cleanCode = code.toUpperCase().trim();
  const sub = parseFloat(subtotal) || 0;

  if (cleanCode === 'CODEALPHA10') {
    const discount = parseFloat((sub * 0.10).toFixed(2));
    return res.json({
      success: true,
      code: cleanCode,
      type: 'percentage',
      discount,
      message: 'Coupon applied! 10% discount deducted.'
    });
  } else if (cleanCode === 'ALPHA20') {
    if (sub < 100) {
      return res.status(400).json({ success: false, message: 'Coupon ALPHA20 requires a minimum order of $100.' });
    }
    const discount = parseFloat((sub * 0.20).toFixed(2));
    return res.json({
      success: true,
      code: cleanCode,
      type: 'percentage',
      discount,
      message: 'Special 20% CodeAlpha discount applied!'
    });
  } else if (cleanCode === 'FREESHIP') {
    return res.json({
      success: true,
      code: cleanCode,
      type: 'shipping',
      discount: 15.00,
      message: 'Free Express Shipping unlocked!'
    });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
  }
});

// Create Order (Checkout)
app.post('/api/orders', optionalAuth, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, discount, shipping, total } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    const userId = req.user ? req.user.id : (shippingAddress.email ? `guest-${shippingAddress.email}` : 'guest');

    const newOrder = db.createOrder({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shipping,
      total
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get User's Orders
app.get('/api/orders/my-orders', requireAuth, (req, res) => {
  try {
    const orders = db.getOrdersByUserId(req.user.id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback for HTML5 client-side navigation (send index.html for unknown web paths)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeAlpha E-Commerce Store Backend running!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📦 REST APIs active at http://localhost:${PORT}/api/`);
  console.log(`====================================================`);
});
