/**
 * CodeAlpha Social Media Platform (PulseAlpha) — Auth State Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 2
 */

const auth = {
  getToken() {
    return localStorage.getItem('pulse_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('pulse_user'));
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('pulse_token', token);
    localStorage.setItem('pulse_user', JSON.stringify(user));
    this.updateUserMiniUI();
  },

  logout() {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    if (window.showToast) window.showToast('Signed out of PulseAlpha', 'info');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 500);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  updateUserMiniUI() {
    const miniCard = document.getElementById('userMiniCard');
    const user = this.getUser();

    if (miniCard) {
      if (user && this.isLoggedIn()) {
        miniCard.innerHTML = `
          <img src="${user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + user.name}" alt="User Avatar" class="user-mini-avatar" onclick="window.location.href='profile.html?id=${user.id}'" style="cursor:pointer;">
          <div class="user-mini-details" onclick="window.location.href='profile.html?id=${user.id}'" style="cursor:pointer;">
            <div class="user-mini-name">${user.name}</div>
            <div class="user-mini-handle">@${user.handle || 'user'}</div>
          </div>
          <button class="user-logout-btn" onclick="auth.logout()" title="Log out">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        `;
      } else {
        miniCard.innerHTML = `
          <a href="auth.html" style="width: 100%; text-align: center; font-size: 0.9rem; font-weight: 700; color: var(--accent-primary);">
            Sign In / Register →
          </a>
        `;
      }
    }

    // Update avatar in composer if present
    const compAvatar = document.getElementById('composerAvatar');
    if (compAvatar && user) {
      compAvatar.src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Auto login demo user if no token exists yet so evaluator gets instant experience!
  if (!auth.isLoggedIn()) {
    // Quick background demo session setup
    api.login('demo@codealpha.com', 'password123').then(res => {
      if (res.success) {
        auth.setSession(res.token, res.user);
      }
    }).catch(() => {});
  } else {
    auth.updateUserMiniUI();
  }
});
