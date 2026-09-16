# CodeAlpha Internship — Task 2: Full Stack Social Media Platform (PulseAlpha)

![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full_Stack_Internship-blueviolet?style=for-the-badge)
![Task](https://img.shields.io/badge/Task-2:_Social_Media_Platform-purple?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Node.js_|_Express_|_HTML5_|_CSS3_|_JavaScript-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

A modern, responsive **Full Stack Social Media Platform ("PulseAlpha")** built from scratch for the **CodeAlpha Full Stack Development Internship Program** by **Veernarayan**.

---

## 🌟 Features Overview

### 👤 1. User Profiles & Follower System
- **Rich User Profile View:** Displays cover banner, user avatar, bio, location, personal website, and joined date.
- **Dynamic Stats:** Real-time counters for **Posts Count**, **Followers Count**, and **Following Count**.
- **Interactive Follow / Unfollow System:** Instant follow toggles synchronized with backend database and live counters.
- **Dedicated User Profiles Page:** Inspect any user's profile and their personal feed (`profile.html?id=usr-demo`).

### 📰 2. News Feed & Post Creation
- **Composer Widget:** Share thoughts, developer updates, and code accomplishments with auto-resizing text and clickable hashtags.
- **Photo Attachments:** Supports one-click photo presets (Developer Desk, Cloud Servers, Setup) or custom image URLs.
- **Multi-Tab Feed Filtering:**
  - **For You (All):** Complete chronological feed of the community.
  - **Following:** Filter posts only by users you follow.
  - **Trending:** Posts ranked by high engagement (likes + comments).

### ❤️ 3. Engagement: Likes & Comments
- **Heart Like System:** Instant like toggling with heart pop animations and like counters.
- **Interactive Comments Section:** Inline comments accordion under every post with instant comment submission and author avatars.
- **Share Link:** Copy direct link to any post.

### 🔐 4. Authentication & Security
- User registration and login powered by **bcrypt** password hashing and **JWT** session tokens.
- Built-in **"Auto-Fill Demo Credentials"** button (`demo@codealpha.com` / `password123`) for evaluator testing.

### ⚡ 5. Backend REST API & Database
- Express.js backend with clean REST architecture.
- Atomic JSON persistent storage engine with zero external dependencies.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (3-Column Layout, Glassmorphism, Micro-animations), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js, CORS, Body-Parser |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Database** | File-backed atomic JSON persistent database |

---

## 🚀 Quick Start Guide

### 1. Open Terminal and Navigate to Backend
```bash
cd Task-2_Social_Media_Platform/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
The server will run at:
👉 **`http://localhost:5001`**

Open `http://localhost:5001` in your browser to experience PulseAlpha!

---

## 🔑 Demo Credentials for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Intern / User** | `demo@codealpha.com` | `password123` |

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Backend status check | No |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Sign in & return JWT token | No |
| `GET` | `/api/auth/profile` | Get logged-in user profile & stats | **Yes** |
| `GET` | `/api/posts` | Retrieve feed posts (filter: `all`, `trending`, `following`) | Optional |
| `POST` | `/api/posts` | Publish a new post with text, tags & image | **Yes** |
| `POST` | `/api/posts/:id/like` | Toggle like / unlike on a post | **Yes** |
| `POST` | `/api/posts/:id/comments` | Post a comment on a post | **Yes** |
| `GET` | `/api/users/:id` | Get specific user profile & follow stats | Optional |
| `POST` | `/api/users/:id/follow` | Toggle follow / unfollow user | **Yes** |
| `GET` | `/api/sidebar` | Get trending tags and suggested creators | Optional |

---

### Developed with ❤️ by Veernarayan for CodeAlpha Internship
