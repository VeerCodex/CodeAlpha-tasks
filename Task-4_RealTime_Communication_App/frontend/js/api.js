/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — API Client
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('collab_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const api = {
  async getRooms() {
    const res = await fetch(`${API_BASE}/rooms`);
    return await res.json();
  },

  async getRoom(code) {
    const res = await fetch(`${API_BASE}/rooms/${code}`, { headers: getAuthHeaders() });
    return await res.json();
  },

  async createRoom(title) {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    return await res.json();
  },

  async sendMessage(roomCode, content) {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return await res.json();
  },

  async shareFile(roomCode, fileData) {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/files`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(fileData)
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

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  }
};
