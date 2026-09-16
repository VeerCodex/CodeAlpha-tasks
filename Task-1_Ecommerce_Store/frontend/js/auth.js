/**
 * CodeAlpha E-Commerce Store — Authentication State Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 1
 */

const auth = {
  getToken() {
    return localStorage.getItem('codealpha_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('codealpha_user'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('codealpha_token', token);
    localStorage.setItem('codealpha_user', JSON.stringify(user));
    this.updateNavUI();
  },

  logout() {
    localStorage.removeItem('codealpha_token');
    localStorage.removeItem('codealpha_user');
    this.updateNavUI();
    if (window.showToast) {
      window.showToast('Logged out successfully', 'info');
    }
    // If currently on profile page, redirect to home
    if (window.location.pathname.includes('profile.html')) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  updateNavUI() {
    const authNavContainer = document.getElementById('navAuthContainer');
    if (!authNavContainer) return;

    const user = this.getUser();
    if (user && this.isLoggedIn()) {
      authNavContainer.innerHTML = `
        <div class="user-profile-menu" onclick="window.location.href='profile.html'" title="View Profile & Orders">
          <img src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}" alt="${user.name}" class="user-avatar-mini">
          <span class="user-name-mini">${user.name.split(' ')[0]}</span>
        </div>
      `;
    } else {
      authNavContainer.innerHTML = `
        <a href="auth.html" class="auth-btn-nav">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>Sign In</span>
        </a>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  auth.updateNavUI();
});
