const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_USERS = [
  {
    id: "usr-1",
    name: "Veernarayan",
    email: "demo@codealpha.com",
    role: "Meeting Host & Lead Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "usr-2",
    name: "Aarav Sharma",
    email: "aarav@codealpha.com",
    role: "Frontend Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "usr-3",
    name: "Sneha Patel",
    email: "sneha@codealpha.com",
    role: "DevOps & Cloud Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
  }
];

const INITIAL_ROOMS = [
  {
    code: "ALPHA-9428-TECH",
    title: "CodeAlpha Full Stack Sprint Standup",
    hostId: "usr-1",
    hostName: "Veernarayan",
    createdAt: new Date().toISOString(),
    isLocked: false,
    encryption: "256-Bit End-to-End Encrypted",
    messages: [
      {
        id: "msg-1",
        userId: "usr-1",
        userName: "Veernarayan",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        content: "Welcome team! Reviewing Task 4 WebRTC video & whiteboard integration today.",
        time: "10:00 AM"
      },
      {
        id: "msg-2",
        userId: "usr-2",
        userName: "Aarav Sharma",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        content: "Screen sharing latency is under 40ms! Canvas strokes syncing smoothly.",
        time: "10:02 AM"
      }
    ],
    files: [
      {
        id: "fl-1",
        name: "Full_Stack_System_Architecture.pdf",
        size: "2.4 MB",
        uploaderName: "Veernarayan",
        time: "10:01 AM",
        url: "#"
      },
      {
        id: "fl-2",
        name: "Sprint_Milestone_Checklist.docx",
        size: "820 KB",
        uploaderName: "Sneha Patel",
        time: "10:03 AM",
        url: "#"
      }
    ]
  }
];

function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    const users = INITIAL_USERS.map(u => ({
      ...u,
      passwordHash: demoPasswordHash
    }));

    const initialData = {
      users,
      rooms: INITIAL_ROOMS
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(data) {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

const db = {
  getRooms() {
    const data = readDb();
    return data.rooms.map(r => ({
      code: r.code,
      title: r.title,
      hostName: r.hostName,
      isLocked: r.isLocked,
      encryption: r.encryption,
      participantsCount: 3
    }));
  },

  getRoomByCode(code) {
    const data = readDb();
    const cleanCode = code.toUpperCase().trim();
    return data.rooms.find(r => r.code === cleanCode) || null;
  },

  createRoom(roomData) {
    const data = readDb();
    const code = `ALPHA-${Math.floor(1000 + Math.random() * 9000)}-${(roomData.title || 'ROOM').substring(0, 4).toUpperCase()}`;

    const newRoom = {
      code,
      title: roomData.title || "Collaboration Session",
      hostId: roomData.hostId || "usr-1",
      hostName: roomData.hostName || "Veernarayan",
      createdAt: new Date().toISOString(),
      isLocked: false,
      encryption: "256-Bit End-to-End Encrypted",
      messages: [],
      files: []
    };

    data.rooms.unshift(newRoom);
    writeDb(data);
    return newRoom;
  },

  addMessage(roomCode, msgData) {
    const data = readDb();
    const room = data.rooms.find(r => r.code === roomCode.toUpperCase().trim());
    if (!room) return null;

    const newMsg = {
      id: `msg-${Date.now()}`,
      userId: msgData.userId,
      userName: msgData.userName || "Participant",
      userAvatar: msgData.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msgData.userName || 'User')}`,
      content: msgData.content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!room.messages) room.messages = [];
    room.messages.push(newMsg);
    writeDb(data);
    return newMsg;
  },

  addFile(roomCode, fileData) {
    const data = readDb();
    const room = data.rooms.find(r => r.code === roomCode.toUpperCase().trim());
    if (!room) return null;

    const newFile = {
      id: `fl-${Date.now()}`,
      name: fileData.name,
      size: fileData.size || "1.2 MB",
      uploaderName: fileData.uploaderName || "Participant",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: fileData.url || "#"
    };

    if (!room.files) room.files = [];
    room.files.push(newFile);
    writeDb(data);
    return newFile;
  },

  getUsers() {
    const data = readDb();
    return data.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar }));
  },

  getUserByEmail(email) {
    const data = readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  createUser(userData) {
    const data = readDb();
    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || "Developer",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`
    };

    data.users.push(newUser);
    writeDb(data);
    return newUser;
  }
};

initDb();

module.exports = db;
