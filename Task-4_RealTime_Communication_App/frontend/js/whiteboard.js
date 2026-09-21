/**
 * CodeAlpha Real-Time Communication App (CollabAlpha) — Interactive Whiteboard Canvas
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 4
 */

const whiteboard = {
  canvas: null,
  ctx: null,
  isDrawing: false,
  currentColor: '#06b6d4',
  currentSize: 3,
  isEraser: false,
  lastX: 0,
  lastY: 0,

  init() {
    this.canvas = document.getElementById('whiteboardCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.bindDrawingEvents();
    this.bindToolbarEvents();
  },

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Preserve existing drawing on resize
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0);

    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.drawImage(tempCanvas, 0, 0);
  },

  bindDrawingEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const start = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const move = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);

      this.drawStroke(this.lastX, this.lastY, pos.x, pos.y, this.isEraser ? '#0d121e' : this.currentColor, this.isEraser ? this.currentSize * 4 : this.currentSize);

      // Broadcast to WebSocket
      if (window.meeting && window.meeting.ws && window.meeting.ws.readyState === WebSocket.OPEN) {
        window.meeting.ws.send(JSON.stringify({
          type: 'whiteboard-stroke',
          x0: this.lastX,
          y0: this.lastY,
          x1: pos.x,
          y1: pos.y,
          color: this.isEraser ? '#0d121e' : this.currentColor,
          size: this.isEraser ? this.currentSize * 4 : this.currentSize
        }));
      }

      this.lastX = pos.x;
      this.lastY = pos.y;
    };

    const end = () => {
      this.isDrawing = false;
    };

    // Mouse & Touch events
    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mousemove', move);
    this.canvas.addEventListener('mouseup', end);
    this.canvas.addEventListener('mouseleave', end);

    this.canvas.addEventListener('touchstart', start);
    this.canvas.addEventListener('touchmove', move);
    this.canvas.addEventListener('touchend', end);
  },

  drawStroke(x0, y0, x1, y1, color, size) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.moveTo(x0, y0);
    this.ctx.lineTo(x1, y1);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.stroke();
    this.ctx.closePath();
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
