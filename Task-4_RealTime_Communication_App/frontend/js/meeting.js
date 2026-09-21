/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — Room & Meeting Coordinator
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
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
  if (type === 'success') icon = '🚀';
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

window.meeting = {
  currentRoomCode: 'ALPHA-9428-TECH',
  ws: null,
  activeView: 'video',
  activeDrawer: null,

  async init() {
    webrtc.initLocalMedia();
    whiteboard.init();
    this.bindControls();
    await this.loadRoom(this.currentRoomCode);
    this.initWebSocket();
  },

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        const user = auth.getUser();
        this.ws.send(JSON.stringify({
          type: 'join-room',
          roomCode: this.currentRoomCode,
          userName: user ? user.name : 'Veernarayan'
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'whiteboard-stroke') {
            whiteboard.drawStroke(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
          } else if (data.type === 'clear-whiteboard') {
            whiteboard.clearCanvas(false);
          } else if (data.type === 'chat-broadcast') {
            this.appendChatMessage(data.message);
          } else if (data.type === 'file-broadcast') {
            this.appendFileCard(data.file);
          } else if (data.type === 'user-joined') {
            window.showToast(`${data.userName} joined the meeting!`, 'info');
          }
        } catch (e) {
          console.error('WS message error', e);
        }
      };
    } catch (err) {
      console.warn('WebSocket signaling unavailable; running standalone.', err);
    }
  },

  async loadRoom(code) {
    try {
      const res = await api.getRoom(code);
      if (res.success && res.room) {
        document.getElementById('roomTitleDisplay').textContent = res.room.title;
        document.getElementById('roomCodeDisplay').textContent = res.room.code;

        // Render past messages
        const chatList = document.getElementById('meetingChatList');
        if (chatList && res.room.messages) {
          chatList.innerHTML = '';
          res.room.messages.forEach(m => this.appendChatMessage(m));
        }

        // Render past files
        const fileList = document.getElementById('meetingFilesList');
        if (fileList && res.room.files) {
          fileList.innerHTML = '';
          res.room.files.forEach(f => this.appendFileCard(f));
        }
      }
    } catch (err) {
      console.error('Room load error', err);
    }
  },

  bindControls() {
    // View Switcher (Video vs Whiteboard)
    document.querySelectorAll('.view-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchView(btn.getAttribute('data-view'));
      });
    });

    // Media Buttons
    document.getElementById('btnToggleMic').addEventListener('click', () => webrtc.toggleAudio());
    document.getElementById('btnToggleCam').addEventListener('click', () => webrtc.toggleVideo());
    document.getElementById('btnToggleScreen').addEventListener('click', () => webrtc.toggleScreenShare());

    // Drawer Toggles
    document.getElementById('btnToggleChat').addEventListener('click', () => this.toggleDrawer('chat'));
    document.getElementById('btnToggleFiles').addEventListener('click', () => this.toggleDrawer('files'));

    // Copy Room Code
    document.getElementById('btnCopyRoomCode').addEventListener('click', () => {
      navigator.clipboard.writeText(this.currentRoomCode).then(() => {
        window.showToast(`Room Code ${this.currentRoomCode} copied!`, 'success');
      });
    });

    // End Call
    document.getElementById('btnEndCall').addEventListener('click', () => {
      if (confirm('Leave this collaboration session?')) {
        window.location.reload();
      }
    });

    // Chat Input Enter Key
    const chatInput = document.getElementById('chatInputMessage');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSendChat();
      });
    }
  },

  switchView(viewMode) {
    this.activeView = viewMode;
    const videoStage = document.getElementById('videoGridStage');
    const wbStage = document.getElementById('whiteboardStage');

    if (viewMode === 'whiteboard') {
      if (videoStage) videoStage.style.display = 'none';
      if (wbStage) {
        wbStage.classList.add('active');
        whiteboard.resizeCanvas();
      }
      window.showToast('Switched to Collaborative Whiteboard', 'info');
    } else {
      if (videoStage) videoStage.style.display = 'grid';
      if (wbStage) wbStage.classList.remove('active');
      window.showToast('Switched to Video Conference Grid', 'info');
    }
  },

  toggleDrawer(drawerName) {
    const chatDrawer = document.getElementById('chatDrawer');
    const filesDrawer = document.getElementById('filesDrawer');

    if (this.activeDrawer === drawerName) {
      // Close
      if (chatDrawer) chatDrawer.classList.remove('open');
      if (filesDrawer) filesDrawer.classList.remove('open');
      this.activeDrawer = null;
    } else {
      if (drawerName === 'chat') {
        if (chatDrawer) chatDrawer.classList.add('open');
        if (filesDrawer) filesDrawer.classList.remove('open');
        const input = document.getElementById('chatInputMessage');
        if (input) input.focus();
      } else {
        if (filesDrawer) filesDrawer.classList.add('open');
        if (chatDrawer) chatDrawer.classList.remove('open');
      }
      this.activeDrawer = drawerName;
    }
  },

  async handleSendChat() {
    const input = document.getElementById('chatInputMessage');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    try {
      const res = await api.sendMessage(this.currentRoomCode, text);
      if (res.success && res.message) {
        this.appendChatMessage(res.message);

        // Broadcast to peers
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'chat-broadcast',
            message: res.message
          }));
        }
      }
    } catch (err) {
      window.showToast('Failed to send message', 'error');
    }
  },

  appendChatMessage(msg) {
    const list = document.getElementById('meetingChatList');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'chat-msg-row';
    item.innerHTML = `
      <img src="${msg.userAvatar}" alt="${msg.userName}" class="chat-msg-avatar">
      <div class="chat-msg-bubble">
        <div class="chat-msg-author">
          <span>${msg.userName}</span>
          <span style="color:var(--text-muted);">${msg.time}</span>
        </div>
        <div>${msg.content}</div>
      </div>
    `;

    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  },

  async handleUploadDemoFile() {
    const presets = [
      { name: "CodeAlpha_Deliverables.pdf", size: "1.8 MB" },
      { name: "Whiteboard_Snapshot_v2.png", size: "940 KB" },
      { name: "API_Schema_Documentation.json", size: "120 KB" }
    ];

    const pick = presets[Math.floor(Math.random() * presets.length)];

    try {
      const res = await api.shareFile(this.currentRoomCode, pick);
      if (res.success && res.file) {
        this.appendFileCard(res.file);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'file-broadcast',
            file: res.file
          }));
        }
        window.showToast(`Shared file: ${pick.name}`, 'success');
      }
    } catch (err) {
      window.showToast('Could not share file', 'error');
    }
  },

  appendFileCard(file) {
    const list = document.getElementById('meetingFilesList');
    if (!list) return;

    const item = document.createElement('div');
    item.className = 'file-card-item';
    item.innerHTML = `
      <div class="file-meta">
        <h4>📄 ${file.name}</h4>
        <p>${file.size} • Shared by ${file.uploaderName}</p>
      </div>
      <button class="file-dl-btn" onclick="window.showToast('Downloading ${file.name}...', 'info')">
        Download
      </button>
    `;

    list.appendChild(item);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  meeting.init();
});
