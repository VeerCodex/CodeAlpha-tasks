/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — Interactive Whiteboard Canvas
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
 * Features: High-precision Pointer Events (Trackpad, Mouse, Stylus & Touch Support)
 */

const whiteboard = {
  canvas: null,
  ctx: null,
  isDrawing: false,
  currentColor: '#1a73e8', // Google Blue
  currentSize: 3,
  isEraser: false,
  lastX: 0,
  lastY: 0,

  init() {
    this.canvas = document.getElementById('whiteboardCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    
    // Ensure trackpads and touch devices do not trigger browser gestures
    this.canvas.style.touchAction = 'none';

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.bindDrawingEvents();
    this.bindToolbarEvents();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Snapshot existing canvas drawing
    let tempCanvas = null;
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(this.canvas, 0, 0);
    }

    const rect = parent.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width);
    this.canvas.height = Math.floor(rect.height);

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (tempCanvas) {
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
  },

  bindDrawingEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      this.isDrawing = true;

      // Lock pointer capture for trackpad drag continuity
      try {
        if (e.pointerId && this.canvas.setPointerCapture) {
          this.canvas.setPointerCapture(e.pointerId);
        }
      } catch (err) {}

      const pos = getPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;

      // Draw single dot on click/tap
      this.drawStroke(this.lastX, this.lastY, pos.x + 0.1, pos.y + 0.1, this.isEraser ? '#ffffff' : this.currentColor, this.isEraser ? this.currentSize * 5 : this.currentSize);
    };

    const onPointerMove = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();

      const pos = getPos(e);

      const strokeColor = this.isEraser ? '#ffffff' : this.currentColor;
      const strokeSize = this.isEraser ? this.currentSize * 5 : this.currentSize;

      this.drawStroke(this.lastX, this.lastY, pos.x, pos.y, strokeColor, strokeSize);

      // Broadcast to WebSocket peers
      if (window.meeting && window.meeting.ws && window.meeting.ws.readyState === WebSocket.OPEN) {
        window.meeting.ws.send(JSON.stringify({
          type: 'whiteboard-stroke',
          x0: this.lastX,
          y0: this.lastY,
          x1: pos.x,
          y1: pos.y,
          color: strokeColor,
          size: strokeSize
        }));
      }

      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const onPointerUp = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;

      try {
        if (e && e.pointerId && this.canvas.releasePointerCapture) {
          this.canvas.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
    };

    // Primary: Modern Pointer Events (trackpad, mouse, touchscreen, stylus)
    this.canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    this.canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    this.canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    this.canvas.addEventListener('pointercancel', onPointerUp, { passive: false });
    this.canvas.addEventListener('lostpointercapture', onPointerUp, { passive: false });

    // Fallbacks
    this.canvas.addEventListener('mousedown', onPointerDown);
    this.canvas.addEventListener('mousemove', onPointerMove);
    this.canvas.addEventListener('mouseup', onPointerUp);
    this.canvas.addEventListener('mouseleave', onPointerUp);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) onPointerDown(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchend', onPointerUp, { passive: false });
  },

  drawStroke(x0, y0, x1, y1, color, size) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  },

  bindToolbarEvents() {
    // Colors
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.currentColor = swatch.getAttribute('data-color');
        this.isEraser = false;
        const eraserBtn = document.getElementById('btnEraser');
        if (eraserBtn) eraserBtn.classList.remove('active');
      });
    });

    // Brush Sizes
    document.querySelectorAll('.brush-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSize = parseInt(btn.getAttribute('data-size'));
      });
    });

    // Eraser Tool
    const eraserBtn = document.getElementById('btnEraser');
    if (eraserBtn) {
      eraserBtn.addEventListener('click', () => {
        this.isEraser = !this.isEraser;
        eraserBtn.classList.toggle('active', this.isEraser);
        if (this.isEraser) {
          window.showToast('Eraser selected', 'info');
        } else {
          window.showToast('Pen selected', 'info');
        }
      });
    }

    // Clear Canvas Button
    const clearBtn = document.getElementById('btnClearWhiteboard');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCanvas(true));
    }

    // Download Drawing
    const downloadBtn = document.getElementById('btnDownloadDrawing');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadDrawing());
    }
  },

  clearCanvas(broadcast = false) {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    window.showToast('Whiteboard cleared', 'info');

    if (broadcast && window.meeting && window.meeting.ws && window.meeting.ws.readyState === WebSocket.OPEN) {
      window.meeting.ws.send(JSON.stringify({ type: 'clear-whiteboard' }));
    }
  },

  downloadDrawing() {
    const link = document.createElement('a');
    link.download = `CollabAlpha_Whiteboard_${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
    window.showToast('Whiteboard saved as PNG!', 'success');
  }
};
