/**
 * CodeAlpha Social Media Platform (PulseAlpha) — API Client
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 2
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('pulse_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const api = {
  async getFeed(filter = 'all') {
    const res = await fetch(`${API_BASE}/posts?filter=${filter}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async createPost(postData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData)
    });
    return await res.json();
  },

  async toggleLike(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async addComment(postId, content) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return await res.json();
  },

  async getUser(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async toggleFollow(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async getSidebar() {
    const res = await fetch(`${API_BASE}/sidebar`, {
      headers: getAuthHeaders()
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
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  }
};
