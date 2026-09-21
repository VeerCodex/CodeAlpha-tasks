const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { WebSocketServer, WebSocket } = require('ws');

const db = require('./database/db');
const { requireAuth, optionalAuth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'CodeAlpha Full Stack Internship — Task 4: Real-Time Communication App (CollabAlpha)',
    developer: 'Veernarayan',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

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
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already exists.' });

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

app.get('/api/auth/profile', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Rooms REST API
app.get('/api/rooms', (req, res) => {
  res.json({ success: true, rooms: db.getRooms() });
});

app.post('/api/rooms', requireAuth, (req, res) => {
  try {
    const { title } = req.body;
    const room = db.createRoom({
      title: title || "Project Collaboration Sprint",
      hostId: req.user.id,
      hostName: req.user.name
    });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/rooms/:code', optionalAuth, (req, res) => {
  try {
    const room = db.getRoomByCode(req.params.code);
    if (!room) return res.status(404).json({ success: false, message: 'Meeting room not found.' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/rooms/:code/messages', requireAuth, (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });

    const msg = db.addMessage(req.params.code, {
      userId: req.user.id,
      userName: req.user.name,
      content
    });

    if (!msg) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/rooms/:code/files', requireAuth, (req, res) => {
  try {
    const { name, size, url } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'File name required.' });

    const file = db.addFile(req.params.code, {
      name,
      size: size || "1.5 MB",
      uploaderName: req.user.name,
      url: url || "#"
    });

    if (!file) return res.status(404).json({ success: false, message: 'Room not found.' });
    res.status(201).json({ success: true, file });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Fallback HTML5 routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }
});

// Create HTTP and WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Map: roomCode -> Set of client sockets
const roomClients = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'join-room') {
        currentRoom = msg.roomCode.toUpperCase();
        if (!roomClients.has(currentRoom)) {
          roomClients.set(currentRoom, new Set());
        }
        roomClients.get(currentRoom).add(ws);

        // Broadcast user joined
        broadcastToRoom(currentRoom, ws, {
          type: 'user-joined',
          userName: msg.userName || 'Peer',
          participantsCount: roomClients.get(currentRoom).size
        });
      } else if (msg.type === 'whiteboard-stroke' || msg.type === 'clear-whiteboard' || msg.type === 'chat-broadcast' || msg.type === 'file-broadcast') {
        if (currentRoom) {
          broadcastToRoom(currentRoom, ws, msg);
        }
      }
    } catch (err) {
      console.error('WebSocket message parse error', err);
    }
  });

  ws.on('close', () => {
    if (currentRoom && roomClients.has(currentRoom)) {
      roomClients.get(currentRoom).delete(ws);
      broadcastToRoom(currentRoom, null, {
        type: 'user-left',
        participantsCount: roomClients.get(currentRoom).size
      });
      if (roomClients.get(currentRoom).size === 0) {
        roomClients.delete(currentRoom);
      }
    }
  });
});

function broadcastToRoom(roomCode, senderWs, payload) {
  const clients = roomClients.get(roomCode);
  if (!clients) return;

  const data = JSON.stringify(payload);
  for (const client of clients) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 CodeAlpha Real-Time Studio (CollabAlpha) running!`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Signaling active on ws://localhost:${PORT}`);
  console.log(`====================================================`);
});
