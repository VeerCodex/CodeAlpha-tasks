const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

const INITIAL_USERS = [
  {
    id: "usr-1",
    name: "Veernarayan",
    email: "demo@codealpha.com",
    role: "Lead Full Stack Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "usr-2",
    name: "Aarav Sharma",
    email: "aarav@codealpha.com",
    role: "Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "usr-3",
    name: "Sneha Patel",
    email: "sneha@codealpha.com",
    role: "DevOps & Cloud Specialist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "usr-4",
    name: "Rohan Verma",
    email: "rohan@codealpha.com",
    role: "QA & Security Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  }
];

const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    name: "AlphaStore E-Commerce Suite",
    key: "ALPH",
    description: "Production-ready full-stack online storefront with modern checkout and responsive UI.",
    color: "#6366f1",
    members: ["usr-1", "usr-2", "usr-3", "usr-4"]
  },
  {
    id: "proj-2",
    name: "PulseAlpha Social Network",
    key: "PULS",
    description: "Next-gen developer social community with interactive feeds, animated likes, and follower system.",
    color: "#ec4899",
    members: ["usr-1", "usr-2", "usr-3"]
  },
  {
    id: "proj-3",
    name: "Cloud Infrastructure CI/CD",
    key: "CLOU",
    description: "Automated deployment pipelines and microservices clustering with zero-downtime rollouts.",
    color: "#06b6d4",
    members: ["usr-1", "usr-3"]
  }
];

const INITIAL_TASKS = [
  {
    id: "tsk-101",
    projectId: "proj-1",
    title: "Design Cyber-Luxury Glassmorphism UI",
    description: "Create sleek dark mode styling, curated HSL color palette, and micro-animations for cards.",
    column: "done",
    priority: "HIGH",
    dueDate: "2026-09-18",
    assigneeId: "usr-2",
    subtasks: [
      { id: "st-1", text: "Import Google Fonts (Outfit & Plus Jakarta Sans)", done: true },
      { id: "st-2", text: "Design responsive product cards with hover glow", done: true },
      { id: "st-3", text: "Test mobile viewport layout", done: true }
    ],
    comments: [
      {
        id: "cm-1",
        userId: "usr-1",
        userName: "Veernarayan",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        content: "The card contrast and border glows look stellar on 4K displays!",
        date: "2026-09-17 10:30"
      }
    ]
  },
  {
    id: "tsk-102",
    projectId: "proj-1",
    title: "Implement JWT Session & Bcrypt Authentication",
    description: "Build robust authentication routes for user registration, token generation, and profile retrieval.",
    column: "done",
    priority: "HIGH",
    dueDate: "2026-09-20",
    assigneeId: "usr-1",
    subtasks: [
      { id: "st-4", text: "Bcrypt password salting & verification", done: true },
      { id: "st-5", text: "Authorization Bearer token header middleware", done: true }
    ],
    comments: []
  },
  {
    id: "tsk-103",
    projectId: "proj-1",
    title: "Interactive Cart Drawer & Promo Coupon System",
    description: "Support instant quantity increments, discount codes (CODEALPHA10, ALPHA20), and subtotal computation.",
    column: "review",
    priority: "MEDIUM",
    dueDate: "2026-09-24",
    assigneeId: "usr-1",
    subtasks: [
      { id: "st-6", text: "Cart drawer slide-out animation", done: true },
      { id: "st-7", text: "Coupon code validation endpoint", done: true },
      { id: "st-8", text: "Cross-check shipping fees threshold ($150)", done: false }
    ],
    comments: [
      {
        id: "cm-2",
        userId: "usr-3",
        userName: "Sneha Patel",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        content: "Tested coupon validation with $120 cart. 10% discount works seamlessly.",
        date: "2026-09-21 14:15"
      }
    ]
  },
  {
    id: "tsk-104",
    projectId: "proj-1",
    title: "Automated Test Suite & API Benchmark",
    description: "Write end-to-end integration tests verifying health, orders, and review submission endpoints.",
    column: "inprogress",
    priority: "HIGH",
    dueDate: "2026-09-26",
    assigneeId: "usr-3",
    subtasks: [
      { id: "st-9", text: "Test GET /api/products response times", done: true },
      { id: "st-10", text: "Verify database persistence after restart", done: false }
    ],
    comments: []
  },
  {
    id: "tsk-105",
    projectId: "proj-1",
    title: "Security Penetration & Payload Sanitization",
    description: "Verify XSS protection, input validation schemas, and rate-limiting triggers.",
    column: "todo",
    priority: "LOW",
    dueDate: "2026-09-28",
    assigneeId: "usr-4",
    subtasks: [
      { id: "st-11", text: "Validate SQL/JSON injection edge cases", done: false },
      { id: "st-12", text: "Review CORS configuration", done: false }
    ],
    comments: []
  },
  {
    id: "tsk-201",
    projectId: "proj-2",
    title: "Build Real-Time Heart Like & Comment System",
    description: "Enable instant interactive engagement with optimistic UI updates and heart pop keyframe animations.",
    column: "done",
    priority: "HIGH",
    dueDate: "2026-09-19",
    assigneeId: "usr-1",
    subtasks: [
      { id: "st-13", text: "Heart pop animation", done: true },
      { id: "st-14", text: "Instant comment submission", done: true }
    ],
    comments: []
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
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS
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
  getProjects() {
    const data = readDb();
    return data.projects.map(proj => {
      const projTasks = data.tasks.filter(t => t.projectId === proj.id);
      const doneCount = projTasks.filter(t => t.column === 'done').length;
      const progress = projTasks.length ? Math.round((doneCount / projTasks.length) * 100) : 0;
      return {
        ...proj,
        totalTasks: projTasks.length,
        completedTasks: doneCount,
        progress
      };
    });
  },

  getProjectById(id) {
    const data = readDb();
    const proj = data.projects.find(p => p.id === id);
    if (!proj) return null;

    const projTasks = data.tasks.filter(t => t.projectId === proj.id);
    const doneCount = projTasks.filter(t => t.column === 'done').length;
    const progress = projTasks.length ? Math.round((doneCount / projTasks.length) * 100) : 0;

    const memberDetails = data.users
      .filter(u => proj.members.includes(u.id))
      .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, role: u.role }));

    return {
      ...proj,
      totalTasks: projTasks.length,
      completedTasks: doneCount,
      progress,
      membersList: memberDetails
    };
  },

  createProject(projData) {
    const data = readDb();
    const key = (projData.key || projData.name.substring(0, 4)).toUpperCase();
    const newProj = {
      id: `proj-${Date.now()}`,
      name: projData.name,
      key,
      description: projData.description || "",
      color: projData.color || "#6366f1",
      members: projData.members || ["usr-1", "usr-2"]
    };

    data.projects.push(newProj);
    writeDb(data);
    return newProj;
  },

  getTasksByProject(projectId) {
    const data = readDb();
    const tasks = data.tasks.filter(t => t.projectId === projectId);

    return tasks.map(t => {
      const assignee = data.users.find(u => u.id === t.assigneeId) || null;
      return {
        ...t,
        assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null
      };
    });
  },

  getTaskById(id) {
    const data = readDb();
    const t = data.tasks.find(task => task.id === id);
    if (!t) return null;

    const assignee = data.users.find(u => u.id === t.assigneeId) || null;
    return {
      ...t,
      assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null
    };
  },

  createTask(taskData) {
    const data = readDb();
    const newTask = {
      id: `tsk-${Math.floor(100 + Math.random() * 900)}`,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description || "",
      column: taskData.column || "todo",
      priority: taskData.priority || "MEDIUM",
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      assigneeId: taskData.assigneeId || "usr-1",
      subtasks: taskData.subtasks || [],
      comments: []
    };

    data.tasks.push(newTask);
    writeDb(data);
    return this.getTaskById(newTask.id);
  },

  updateTask(id, updateData) {
    const data = readDb();
    const task = data.tasks.find(t => t.id === id);
    if (!task) return null;

    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.column !== undefined) task.column = updateData.column;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate;
    if (updateData.assigneeId !== undefined) task.assigneeId = updateData.assigneeId;
    if (updateData.subtasks !== undefined) task.subtasks = updateData.subtasks;

    writeDb(data);
    return this.getTaskById(id);
  },

  deleteTask(id) {
    const data = readDb();
    const index = data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;

    data.tasks.splice(index, 1);
    writeDb(data);
    return true;
  },

  addComment(taskId, commentData) {
    const data = readDb();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const user = data.users.find(u => u.id === commentData.userId) || {
      name: "Veernarayan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    };

    const newComment = {
      id: `cm-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentData.content,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (!task.comments) task.comments = [];
    task.comments.push(newComment);

    writeDb(data);
    return newComment;
  },

  toggleSubtask(taskId, subtaskId) {
    const data = readDb();
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return null;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (!sub) return null;

    sub.done = !sub.done;
    writeDb(data);
    return task;
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
      role: userData.role || "Software Developer",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`
    };

    data.users.push(newUser);
    writeDb(data);
    return newUser;
  }
};

initDb();

module.exports = db;
