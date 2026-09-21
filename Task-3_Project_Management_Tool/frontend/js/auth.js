/**
 * CodeAlpha Project Management Tool (TaskAlpha) — Auth State Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 3
 */

const auth = {
  getToken() {
    return localStorage.getItem('taskalpha_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('taskalpha_user'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('taskalpha_token', token);
    localStorage.setItem('taskalpha_user', JSON.stringify(user));
    this.updateUserNavUI();
  },

  logout() {
    localStorage.removeItem('taskalpha_token');
    localStorage.removeItem('taskalpha_user');
    if (window.showToast) window.showToast('Logged out of TaskAlpha', 'info');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 500);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  updateUserNavUI() {
    const userContainer = document.getElementById('navUserContainer');
    const user = this.getUser();

    if (userContainer) {
      if (user && this.isLoggedIn()) {
        userContainer.innerHTML = `
          <div class="nav-user-profile" onclick="auth.logout()" title="Click to Sign Out (${user.name})">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}" alt="${user.name}" class="nav-user-avatar">
            <span class="nav-user-name">${user.name.split(' ')[0]}</span>
          </div>
        `;
      } else {
        userContainer.innerHTML = `
          <a href="auth.html" style="font-size:0.85rem; font-weight:700; color:var(--accent-primary);">
            Sign In →
          </a>
        `;
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!auth.isLoggedIn()) {
    api.login('demo@codealpha.com', 'password123').then(res => {
      if (res.success) {
        auth.setSession(res.token, res.user);
      }
    }).catch(() => {});
  } else {
    auth.updateUserNavUI();
  }
});
