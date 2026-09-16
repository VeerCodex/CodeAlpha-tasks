/**
 * CodeAlpha E-Commerce Store — API Client Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 1
 */

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('codealpha_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const api = {
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return await res.json();
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sort) query.append('sort', params.sort);
    if (params.inStock) query.append('inStock', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    return await res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return await res.json();
  },

  async submitReview(productId, reviewData) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  },

  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
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
  },

  async validateCoupon(code, subtotal) {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    return await res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return await res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return await res.json();
  }
};
