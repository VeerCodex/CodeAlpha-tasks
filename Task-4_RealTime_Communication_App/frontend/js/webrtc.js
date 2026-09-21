/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — WebRTC & Media Manager
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
 */

const webrtc = {
  localStream: null,
  screenStream: null,
  isAudioMuted: false,
  isVideoOff: false,
  isScreenSharing: false,

  async initLocalMedia() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360 },
          audio: true
        });

        const localVideo = document.getElementById('localVideoElement');
        if (localVideo) {
          localVideo.srcObject = this.localStream;
          localVideo.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Camera/Mic permission denied or not available; fallback enabled.', err);
      // Show fallback card placeholder
      const avatarBox = document.getElementById('localAvatarFallback');
      if (avatarBox) avatarBox.style.display = 'flex';
      const localVideo = document.getElementById('localVideoElement');
      if (localVideo) localVideo.style.display = 'none';
    }
  },

  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isAudioMuted;
      });
    }

    const btn = document.getElementById('btnToggleMic');
    const badge = document.getElementById('localMicStatus');
    if (btn) {
      btn.classList.toggle('muted', this.isAudioMuted);
      btn.innerHTML = this.isAudioMuted ? '🔇' : '🎙️';
    }
    if (badge) {
      badge.textContent = this.isAudioMuted ? '🔇' : '🎙️';
    }

    window.showToast(this.isAudioMuted ? 'Microphone muted' : 'Microphone unmuted', 'info');
  },

  toggleVideo() {
    this.isVideoOff = !this.isVideoOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !this.isVideoOff;
      });
    }

    const btn = document.getElementById('btnToggleCam');
    const localVideo = document.getElementById('localVideoElement');
    const avatarBox = document.getElementById('localAvatarFallback');

    if (btn) {
      btn.classList.toggle('off', this.isVideoOff);
      btn.innerHTML = this.isVideoOff ? '🚫' : '📹';
    }

    if (localVideo && avatarBox) {
      if (this.isVideoOff) {
        localVideo.style.display = 'none';
        avatarBox.style.display = 'flex';
      } else {
        localVideo.style.display = 'block';
        avatarBox.style.display = 'none';
      }
    }

    window.showToast(this.isVideoOff ? 'Camera turned off' : 'Camera turned on', 'info');
  },

  async toggleScreenShare() {
    const screenView = document.getElementById('screenShareStage');
    const screenVideo = document.getElementById('screenShareVideo');
    const btn = document.getElementById('btnToggleScreen');

    if (this.isScreenSharing) {
      // Stop Screen Share
      this.isScreenSharing = false;
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(t => t.stop());
        this.screenStream = null;
      }
      if (screenView) screenView.classList.remove('active');
      if (btn) btn.classList.remove('active-dock');
      window.showToast('Screen sharing stopped', 'info');
    } else {
      // Start Screen Share
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (screenVideo) screenVideo.srcObject = this.screenStream;
          
          this.screenStream.getVideoTracks()[0].onended = () => {
            this.toggleScreenShare();
          };
        }
        this.isScreenSharing = true;
        if (screenView) screenView.classList.add('active');
        if (btn) btn.classList.add('active-dock');
        window.showToast('Screen sharing active!', 'success');
      } catch (err) {
        console.warn('Screen share cancelled or failed', err);
        window.showToast('Screen share cancelled', 'info');
      }
    }
  }
};
