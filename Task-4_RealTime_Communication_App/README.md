# CodeAlpha Internship — Task 4: Real-Time Communication App (CollabAlpha)

![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full_Stack_Internship-blueviolet?style=for-the-badge)
![Task](https://img.shields.io/badge/Task-4:_Real--Time_Communication_App-indigo?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-WebRTC_|_WebSockets_|_Node.js_|_Canvas_API-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

A cutting-edge **Google Meet style Real-Time Video Conferencing & Collaborative Jamboard Studio ("CollabAlpha")** built from scratch for the **CodeAlpha Full Stack Development Internship Program** by **Veernarayan**.

---

## 🌟 Features Overview

### 📹 1. Google Meet UI & Video Conferencing
- **Google Meet Design System:** Dark slate background (`#202124`), rounded video tiles with bottom-left participant badges, active speaker blue ring (`#8ab4f8`), and 3-dots tile options.
- **WebRTC Video & Audio Calling:** Native browser-to-browser media streaming with peer connectivity.
- **Microphone Toggle:** Instant mic mute/unmute with Google Red indicator (`#ea4335`).
- **Camera Toggle:** Turn video camera feed on/off with fallback to high-resolution user avatar.
- **Screen Sharing & Hand Raise:** One-click screen sharing using browser `getDisplayMedia` API and interactive ✋ Hand Raise toggle.
- **Signature Google Meet Bottom Dock:** Floating dock with live meeting clock, clickable room code, circular media controls, and red pill leave button.

### 🎨 2. Collaborative Real-Time Jamboard Whiteboard
- **High-Precision Pointer Events Engine:** 100% butter-smooth drawing support for **laptop trackpads**, touchpads, mice, stylus, and touchscreens with `touch-action: none` and pointer capture.
- **Google Jamboard Creative Tools:** Pen drawing, Eraser tool, fine/medium/marker brush sizes, and 6 curated Google color swatches.
- **Clear & Export:** One-click canvas clearing and direct PNG export download.
- **WebSocket Synchronization:** Live stroke broadcasting across all connected room peers.

### 💬 3. Real-Time In-Meeting Chat
- **Instant Messaging:** WebSocket-powered chat with zero polling latency.
- **Formatted Timestamps & Sender Badges:** Clear distinctions between host and attendee messages.
- **Room Persistence:** Chat history saved to the persistent room database so rejoining peers retain context.

### 📁 4. Meeting Asset & File Sharing
- **In-Meeting File Uploads:** Upload PDFs, documents, wireframes, and design specs directly to the room.
- **Direct Download:** Peers can click to instantly download shared assets.

### 🔐 5. Authentication & Security
- **JWT & bcrypt Authentication:** Secure session management and password encryption.
- **Room Code Joining:** Unique 6-character room codes (e.g. `alpha-studio-1`, `dev-standup-4`) with one-click copyable invite links.
- **Evaluator Quick Access:** One-click auto-fill credentials (`demo@codealpha.com` / `password123`) on the sign in page.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5 (Canvas API, MediaDevices API), Vanilla CSS3 (Dark Studio Theme, Glassmorphism), Vanilla JavaScript (ES6+) |
| **Real-Time Signaling** | WebSockets (`ws`), WebRTC PeerConnection APIs |
| **Backend** | Node.js, Express.js, Multer (file upload management), CORS |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Database** | Atomic file-backed JSON storage engine with zero external database dependencies |

---

## 🚀 Quick Start Guide

### 1. Navigate to Backend
```bash
cd Task-4_RealTime_Communication_App/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
node server.js
```
The server will run on:
- **Web App:** `http://localhost:5003`
- **WebSocket Server:** `ws://localhost:5003`

### 4. Open in Browser
Visit `http://localhost:5003` in any modern web browser.

---

## 🔑 Demo Evaluator Credentials

Evaluators can sign in immediately using:
- **Email:** `demo@codealpha.com`
- **Password:** `password123`
- *(Or click the **"⚡ Auto-Fill Demo Credentials"** button on `auth.html`)*

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Authenticate and receive JWT token

### Rooms
- `GET /api/rooms` — List available conference rooms
- `GET /api/rooms/:code` — Retrieve room details, message history, and shared files
- `POST /api/rooms` — Create a new collaboration room
- `POST /api/rooms/:code/join` — Join a room by code

### Real-Time Chat & File Sharing
- `POST /api/rooms/:code/messages` — Post a message in the room
- `POST /api/rooms/:code/files` — Upload a document/asset to the room

### WebSocket Signaling Events
- `join-room` — Connect peer to specific room channel
- `whiteboard-draw` — Broadcast stroke coordinates and tool styles
- `whiteboard-clear` — Clear canvas across all connected peers
- `chat-message` — Broadcast real-time message to active room participants
- `webrtc-offer` / `webrtc-answer` / `webrtc-ice-candidate` — Media stream signaling

---

## 👨‍💻 Author
**Veernarayan**  
Full Stack Development Intern — **CodeAlpha (September 2026 Batch)**
