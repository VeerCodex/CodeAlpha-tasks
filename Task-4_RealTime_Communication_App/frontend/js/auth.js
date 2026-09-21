/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — Auth State Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
 */

const auth = {
  getToken() {
    return localStorage.getItem('collab_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('collab_user'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('collab_token', token);
    localStorage.setItem('collab_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('collab_token');
    localStorage.removeItem('collab_user');
    if (window.showToast) window.showToast('Logged out of CollabAlpha', 'info');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 500);
  },

  isLoggedIn() {
    return !!this.getToken();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.isLoggedIn()) {
    api.login('demo@codealpha.com', 'password123').then(res => {
      if (res.success) {
        auth.setSession(res.token, res.user);
      }
    }).catch(() => {});
  }
});
