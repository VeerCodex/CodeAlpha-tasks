/**
 * CodeAlpha Social Media Platform (PulseAlpha) — Feed & Interactions App
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 2
 */

// Global Toast System
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '🎉';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

const app = {
  currentFilter: 'all',
  selectedAttachmentUrl: null,

  init() {
    this.bindEvents();
    this.loadFeed(this.currentFilter);
    this.loadSidebar();
  },

  bindEvents() {
    // Filter Tabs
    const tabs = document.querySelectorAll('.feed-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.getAttribute('data-filter');
        this.loadFeed(this.currentFilter);
      });
    });

    // Preset Image Chips
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const url = chip.getAttribute('data-url');
        this.setAttachment(url);
      });
    });

    // Remove Attachment Button
    const removeImgBtn = document.getElementById('btnRemoveAttachment');
    if (removeImgBtn) {
      removeImgBtn.addEventListener('click', () => this.clearAttachment());
    }

    // Publish Post Button
    const publishBtn = document.getElementById('btnPublishPost');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.handleCreatePost());
    }
  },

  setAttachment(url) {
    this.selectedAttachmentUrl = url;
    const box = document.getElementById('composerImgPreviewBox');
    const img = document.getElementById('composerImgPreview');
    if (box && img) {
      img.src = url;
      box.style.display = 'block';
    }
  },

  clearAttachment() {
    this.selectedAttachmentUrl = null;
    const box = document.getElementById('composerImgPreviewBox');
    if (box) box.style.display = 'none';
  },

  async handleCreatePost() {
    if (!auth.isLoggedIn()) {
      window.showToast('Please sign in to publish a post', 'error');
      setTimeout(() => window.location.href = 'auth.html', 800);
      return;
    }

    const textarea = document.getElementById('composerTextarea');
    const content = textarea.value.trim();

    if (!content) {
      window.showToast('Post caption cannot be blank', 'error');
      return;
    }

    const btn = document.getElementById('btnPublishPost');
    btn.disabled = true;
    btn.textContent = 'Publishing...';

    try {
      const res = await api.createPost({
        content,
        image: this.selectedAttachmentUrl
      });

      if (res.success) {
        textarea.value = '';
        this.clearAttachment();
        window.showToast('Post shared to your feed!', 'success');
        this.loadFeed(this.currentFilter);
      } else {
        window.showToast(res.message || 'Failed to create post', 'error');
      }
    } catch (err) {
      window.showToast('Server error while posting', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Publish Post';
    }
  },

  async loadFeed(filter = 'all') {
    const feedContainer = document.getElementById('postsStream');
    if (!feedContainer) return;

    feedContainer.innerHTML = `
      <div style="text-align:center; padding: 3rem; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⏳</div>
        <p>Loading posts feed...</p>
      </div>
    `;

    try {
      const res = await api.getFeed(filter);
      if (res.success) {
        if (res.posts.length === 0) {
          feedContainer.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
              <h3 style="color: var(--text-main); margin-bottom: 0.5rem;">No posts in this feed yet</h3>
              <p>Be the first one to share an update or follow other creators!</p>
            </div>
          `;
          return;
        }

        feedContainer.innerHTML = res.posts.map(post => this.renderPostCard(post)).join('');
      }
    } catch (err) {
      feedContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--accent-rose);">Failed to load feed. Ensure server is active.</div>`;
    }
  },

  renderPostCard(post) {
    const currentUser = auth.getUser();
    const isSelf = currentUser && currentUser.id === post.author.id;
    const timeAgo = this.calculateTimeAgo(post.createdAt);

    // Hashtag highlighting
    const formattedContent = post.content.replace(/#(\w+)/g, '<span class="hashtag-highlight" onclick="app.filterByTag(\'$1\')">#$1</span>');

    // Follow button on post
    let followBtnHtml = '';
    if (!isSelf) {
      const followText = post.isFollowingAuthor ? 'Following' : '+ Follow';
      const followClass = post.isFollowingAuthor ? 'following' : '';
      followBtnHtml = `
        <button class="btn-follow-toggle ${followClass}" onclick="app.handleToggleFollow('${post.author.id}', this)">
          ${followText}
        </button>
      `;
    }

    return `
      <article class="post-card" id="post-${post.id}">
        <div class="post-header">
          <div class="post-author-info">
            <img src="${post.author.avatar}" alt="${post.author.name}" class="post-author-avatar" onclick="window.location.href='profile.html?id=${post.author.id}'">
            <div class="post-author-meta">
              <div class="post-author-name" onclick="window.location.href='profile.html?id=${post.author.id}'">
                ${post.author.name}
                <span class="verified-icon">✓</span>
              </div>
              <div class="post-author-handle">@${post.author.handle} • <span class="post-time">${timeAgo}</span></div>
            </div>
          </div>
          ${followBtnHtml}
        </div>

        <div class="post-text">${formattedContent}</div>

        ${post.image ? `
          <div class="post-media-wrap">
            <img src="${post.image}" alt="Post attachment" class="post-media-img" loading="lazy">
          </div>
        ` : ''}

        <div class="post-actions-bar">
          <!-- Like Button -->
          <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}" onclick="app.handleToggleLike('${post.id}', this)">
            <svg width="19" height="19" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span class="like-count-span">${post.likesCount}</span>
          </button>

          <!-- Comment Toggle Button -->
          <button class="action-btn comment-btn" onclick="app.toggleCommentsSection('${post.id}')">
            <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="comment-count-span">${post.commentsCount}</span>
          </button>

          <!-- Share Button -->
          <button class="action-btn share-btn" onclick="app.handleSharePost('${post.id}')">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            <span>Share</span>
          </button>
        </div>

        <!-- Inline Comments Section -->
        <div class="post-comments-section" id="comments-${post.id}">
          <div class="comment-input-row">
            <input type="text" id="comment-input-${post.id}" class="comment-input-field" placeholder="Write a thoughtful reply..." onkeydown="if(event.key==='Enter') app.handleSubmitComment('${post.id}')">
            <button class="btn-send-comment" onclick="app.handleSubmitComment('${post.id}')" title="Send Comment">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>

          <div class="comments-list" id="comments-list-${post.id}">
            ${post.comments.map(c => `
              <div class="comment-item">
                <img src="${c.authorAvatar}" alt="${c.authorName}" class="comment-avatar">
                <div class="comment-body">
                  <div>
                    <span class="comment-author-name">${c.authorName}</span>
                    <span class="comment-time">${this.calculateTimeAgo(c.createdAt)}</span>
                  </div>
                  <div class="comment-text">${c.content}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </article>
    `;
  },

  async handleToggleLike(postId, btnEl) {
    if (!auth.isLoggedIn()) {
      window.showToast('Please sign in to like posts', 'error');
      return;
    }

    try {
      const res = await api.toggleLike(postId);
      if (res.success) {
        const countSpan = btnEl.querySelector('.like-count-span');
        const svg = btnEl.querySelector('svg');

        if (res.isLiked) {
          btnEl.classList.add('liked');
          svg.setAttribute('fill', 'currentColor');
          window.showToast('Liked!', 'info');
        } else {
          btnEl.classList.remove('liked');
          svg.setAttribute('fill', 'none');
        }

        if (countSpan) countSpan.textContent = res.likesCount;
      }
    } catch (err) {
      window.showToast('Failed to update like', 'error');
    }
  },

  toggleCommentsSection(postId) {
    const commentsSec = document.getElementById(`comments-${postId}`);
    if (commentsSec) {
      commentsSec.classList.toggle('open');
      if (commentsSec.classList.contains('open')) {
        const input = document.getElementById(`comment-input-${postId}`);
        if (input) input.focus();
      }
    }
  },

  async handleSubmitComment(postId) {
    if (!auth.isLoggedIn()) {
      window.showToast('Please sign in to comment', 'error');
      return;
    }

    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
      const res = await api.addComment(postId, content);
      if (res.success && res.comment) {
        input.value = '';
        const list = document.getElementById(`comments-list-${postId}`);
        if (list) {
          const newCommentHtml = `
            <div class="comment-item">
              <img src="${res.comment.authorAvatar}" alt="${res.comment.authorName}" class="comment-avatar">
              <div class="comment-body">
                <div>
                  <span class="comment-author-name">${res.comment.authorName}</span>
                  <span class="comment-time">Just now</span>
                </div>
                <div class="comment-text">${res.comment.content}</div>
              </div>
            </div>
          `;
          list.insertAdjacentHTML('beforeend', newCommentHtml);
        }

        // Update comment count on post card
        const postCard = document.getElementById(`post-${postId}`);
        const countSpan = postCard ? postCard.querySelector('.comment-count-span') : null;
        if (countSpan) countSpan.textContent = parseInt(countSpan.textContent || 0) + 1;

        window.showToast('Comment posted!', 'success');
      }
    } catch (err) {
      window.showToast('Failed to submit comment', 'error');
    }
  },

  async handleToggleFollow(userId, btnEl) {
    if (!auth.isLoggedIn()) {
      window.showToast('Please sign in to follow users', 'error');
      return;
    }

    try {
      const res = await api.toggleFollow(userId);
      if (res.success) {
        if (res.isFollowing) {
          btnEl.textContent = 'Following';
          btnEl.classList.add('following');
          window.showToast('You followed this creator!', 'success');
        } else {
          btnEl.textContent = '+ Follow';
          btnEl.classList.remove('following');
          window.showToast('Unfollowed', 'info');
        }
        this.loadSidebar(); // Refresh sidebar suggestions
      }
    } catch (err) {
      window.showToast('Failed to toggle follow', 'error');
    }
  },

  handleSharePost(postId) {
    const shareUrl = `${window.location.origin}/#post-${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      window.showToast('Post link copied to clipboard!', 'success');
    }).catch(() => {
      window.showToast('Post link: ' + shareUrl, 'info');
    });
  },

  filterByTag(tag) {
    window.showToast(`Filtering by tag #${tag}`, 'info');
    const textarea = document.getElementById('composerTextarea');
    if (textarea) {
      textarea.value += ` #${tag}`;
      textarea.focus();
    }
  },

  async loadSidebar() {
    const whoToFollowBox = document.getElementById('whoToFollowList');
    const trendingTagsBox = document.getElementById('trendingTagsList');

    try {
      const res = await api.getSidebar();
      if (res.success) {
        // Render Who to Follow
        if (whoToFollowBox && res.whoToFollow) {
          if (res.whoToFollow.length === 0) {
            whoToFollowBox.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">You are following all creators!</p>`;
          } else {
            whoToFollowBox.innerHTML = res.whoToFollow.map(u => `
              <div class="follow-suggestion-row">
                <div class="suggestion-user-wrap" onclick="window.location.href='profile.html?id=${u.id}'" style="cursor:pointer;">
                  <img src="${u.avatar}" alt="${u.name}" class="suggestion-avatar">
                  <div>
                    <div class="suggestion-name">${u.name}</div>
                    <div class="suggestion-handle">@${u.handle}</div>
                  </div>
                </div>
                <button class="btn-follow-toggle" onclick="app.handleToggleFollow('${u.id}', this)">
                  + Follow
                </button>
              </div>
            `).join('');
          }
        }

        // Render Trending Tags
        if (trendingTagsBox && res.trendingTags) {
          trendingTagsBox.innerHTML = res.trendingTags.map(t => `
            <div class="trending-item" onclick="app.filterByTag('${t.tag}')" style="cursor:pointer;">
              <div>
                <div class="trending-tag">#${t.tag}</div>
                <div class="trending-count">${t.count} posts this week</div>
              </div>
              <span style="color: var(--accent-primary); font-size: 1.1rem;">↗</span>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Sidebar error', err);
    }
  },

  calculateTimeAgo(dateString) {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
