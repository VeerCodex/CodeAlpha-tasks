const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./database/db');
const { requireAuth, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'CodeAlpha Full Stack Internship — Task 3: Project Management Tool (TaskAlpha)',
    developer: 'Veernarayan',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Auth Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({ name, email, passwordHash, role });
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Current User Profile
app.get('/api/auth/profile', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Team Members List
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: db.getUsers() });
});

// Projects: List all
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.getProjects();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Projects: Single
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Projects: Create
app.post('/api/projects', requireAuth, (req, res) => {
  try {
    const { name, description, color, key } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required.' });

    const newProj = db.createProject({ name, description, color, key });
    res.status(201).json({ success: true, project: newProj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Get all for project
app.get('/api/projects/:id/tasks', (req, res) => {
  try {
    const tasks = db.getTasksByProject(req.params.id);
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Create
app.post('/api/tasks', requireAuth, (req, res) => {
  try {
    const { projectId, title, description, column, priority, dueDate, assigneeId, subtasks } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project ID and task title are required.' });
    }

    const newTask = db.createTask({
      projectId,
      title,
      description,
      column,
      priority,
      dueDate,
      assigneeId,
      subtasks
    });

    res.status(201).json({ success: true, message: 'Task created!', task: newTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Get single
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Update (Drag & Drop column change, title, priority, assignee)
app.put('/api/tasks/:id', requireAuth, (req, res) => {
  try {
    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task updated!', task: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Delete
app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  try {
    const deleted = db.deleteTask(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Add Comment
app.post('/api/tasks/:id/comments', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Comment content required.' });

    const comment = db.addComment(req.params.id, {
      userId: req.user.id,
      content
    });

    if (!comment) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tasks: Toggle Subtask
app.post('/api/tasks/:id/subtasks/:subtaskId/toggle', requireAuth, (req, res) => {
  try {
    const updatedTask = db.toggleSubtask(req.params.id, req.params.subtaskId);
    if (!updatedTask) return res.status(404).json({ success: false, message: 'Subtask not found' });
    res.json({ success: true, task: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback HTML5 route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
  }
});

// Boot Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeAlpha Project Management Tool (TaskAlpha) running!`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`📡 REST API: http://localhost:${PORT}/api/`);
  console.log(`====================================================`);
});
