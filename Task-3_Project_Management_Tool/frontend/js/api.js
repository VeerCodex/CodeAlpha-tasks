/**
 * CodeAlpha Project Management Tool (TaskAlpha) — REST API Client
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 3
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('taskalpha_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const api = {
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async getProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async createProject(projectData) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return await res.json();
  },

  async getTasks(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async getTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async createTask(taskData) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return await res.json();
  },

  async updateTask(id, updateData) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return await res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async addComment(taskId, content) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return await res.json();
  },

  async toggleSubtask(taskId, subtaskId) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return await res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  }
};
