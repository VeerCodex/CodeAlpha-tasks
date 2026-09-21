# CodeAlpha Internship — Task 3: Full Stack Project Management Tool (TaskAlpha)

![CodeAlpha Internship](https://img.shields.io/badge/CodeAlpha-Full_Stack_Internship-blueviolet?style=for-the-badge)
![Task](https://img.shields.io/badge/Task-3:_Project_Management_Tool-teal?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Node.js_|_Express_|_HTML5_|_CSS3_|_JavaScript-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

A collaborative **Project Management & Kanban Board Platform ("TaskAlpha")** (Trello & Asana style) built from scratch for the **CodeAlpha Full Stack Development Internship Program** by **Veernarayan**.

---

## 🌟 Features Overview

### 📋 1. Interactive Kanban Workflow Board
- **4 Workflow Stages:** `To Do`, `In Progress`, `Under Review`, and `Completed`.
- **HTML5 Drag-and-Drop:** Seamlessly drag task cards between workflow columns with instant visual dropzone highlights.
- **Dynamic Task Counters:** Live task counter pill on every column header.
- **Project Progress Calculation:** Automatically recalculates % completion as tasks move to "Completed".

### 🏷️ 2. Task Cards & Detail Modal
- **Priority Badges:** High / Urgent (Rose), Medium (Amber), Low (Emerald).
- **Subtask Checklist:** Add actionable subtasks with interactive checkboxes, live strike-through styling, and completion progress bar.
- **Assignee Selection:** Assign tasks to team members with dedicated avatars.
- **Due Date Tracking:** Visual due date badges.
- **Task Comments Discussion:** Real-time conversation thread under each task card.
- **Task Deletion:** One-click task removal with safety prompt.

### 🏢 3. Group Projects Management
- Switch between multiple team projects (`AlphaStore E-Commerce Suite`, `PulseAlpha Social Network`, `Cloud Infrastructure CI/CD`).
- Team members avatar stack displaying contributors on the active project.
- "+ New Task" modal to add tasks to any column instantly.

### 🔐 4. Authentication & Security
- Secure registration and login powered by **bcrypt** password hashing and **JWT** session tokens.
- One-click **"⚡ Auto-Fill Demo Credentials"** (`demo@codealpha.com` / `password123`) for evaluator testing.

### ⚡ 5. Backend REST API & Database
- Express.js backend with RESTful endpoints.
- Persistent file-backed JSON database engine with zero external database dependencies.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5 (Drag and Drop API), Vanilla CSS3 (Dark Luxury Theme, Glassmorphism), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js, CORS, Body-Parser |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`) |
| **Database** | File-backed atomic JSON storage engine |

---

## 🚀 Quick Start Guide

### 1. Navigate to Backend
```bash
cd Task-3_Project_Management_Tool/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
The server will boot up at:
👉 **`http://localhost:5002`**

Open `http://localhost:5002` in your browser to experience TaskAlpha!

---

## 🔑 Demo Credentials for Testing

| Role | Email | Password |
| :--- | :--- | :--- |
| **Lead Architect / Demo User** | `demo@codealpha.com` | `password123` |

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Server status check | No |
| `POST` | `/api/auth/login` | Sign in & receive JWT token | No |
| `POST` | `/api/auth/register` | Create a new user account | No |
| `GET` | `/api/users` | List all team members | No |
| `GET` | `/api/projects` | Get all projects with progress | No |
| `GET` | `/api/projects/:id` | Get single project with members | No |
| `POST` | `/api/projects` | Create a new project board | **Yes** |
| `GET` | `/api/projects/:id/tasks` | Get all tasks for a project | No |
| `POST` | `/api/tasks` | Create a new task card | **Yes** |
| `GET` | `/api/tasks/:id` | Get single task details | No |
| `PUT` | `/api/tasks/:id` | Update task (column, priority, assignee) | **Yes** |
| `DELETE` | `/api/tasks/:id` | Delete task | **Yes** |
| `POST` | `/api/tasks/:id/comments` | Add comment to task | **Yes** |
| `POST` | `/api/tasks/:id/subtasks/:subtaskId/toggle` | Toggle subtask checkbox | **Yes** |

---

### Developed with ❤️ by Veernarayan for CodeAlpha Internship
