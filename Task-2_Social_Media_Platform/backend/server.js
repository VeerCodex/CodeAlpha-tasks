const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./database/db');
const { requireAuth, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'CodeAlpha Full Stack Internship — Task 2: Social Media Platform',
    developer: 'Veernarayan',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Authentication: Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, handle, email, password, bio } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({ name, handle, email, passwordHash, bio });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, handle: newUser.handle, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Welcome to PulseAlpha!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        handle: newUser.handle,
        avatar: newUser.avatar,
        email: newUser.email,
        bio: newUser.bio
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Authentication: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
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
      { id: user.id, name: user.name, handle: user.handle, email: user.email },
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
        handle: user.handle,
        avatar: user.avatar,
        email: user.email,
        bio: user.bio
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Current User Profile
app.get('/api/auth/profile', requireAuth, (req, res) => {
  try {
    const profile = db.getUserById(req.user.id, req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Feed Posts
app.get('/api/posts', optionalAuth, (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const currentUserId = req.user ? req.user.id : null;
    const posts = db.getPosts(filter, currentUserId);
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Post
app.post('/api/posts', requireAuth, (req, res) => {
  try {
    const { content, image, tags } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }

    // Extract hashtags if not provided
    let postTags = tags || [];
    if (!postTags.length) {
      const matched = content.match(/#(\w+)/g);
      if (matched) {
        postTags = matched.map(t => t.replace('#', ''));
      }
    }

    const newPost = db.createPost({
      authorId: req.user.id,
      content: content.trim(),
      image: image ? image.trim() : null,
      tags: postTags
    });

    res.status(201).json({
      success: true,
      message: 'Post published!',
      post: newPost
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle Like
app.post('/api/posts/:id/like', requireAuth, (req, res) => {
  try {
    const result = db.toggleLike(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Comment
app.post('/api/posts/:id/comments', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const comment = db.addComment(req.params.id, {
      authorId: req.user.id,
      content: content.trim()
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      comment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get User Profile by ID
app.get('/api/users/:id', optionalAuth, (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const profile = db.getUserById(req.params.id, currentUserId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle Follow
app.post('/api/users/:id/follow', requireAuth, (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const result = db.toggleFollow(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: result.isFollowing ? 'Followed user!' : 'Unfollowed user.',
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Sidebar Data: Trending Tags & Suggestions
app.get('/api/sidebar', optionalAuth, (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const whoToFollow = db.getWhoToFollow(currentUserId);
    const trendingTags = db.getTrendingTags();
    res.json({ success: true, whoToFollow, trendingTags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeAlpha Social Media Platform running!`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`📡 REST API: http://localhost:${PORT}/api/`);
  console.log(`====================================================`);
});
