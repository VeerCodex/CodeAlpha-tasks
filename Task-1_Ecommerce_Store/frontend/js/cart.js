/**
 * CodeAlpha E-Commerce Store — Cart Management Module
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 1
 */

const CART_STORAGE_KEY = 'codealpha_cart';
const COUPON_STORAGE_KEY = 'codealpha_coupon';

const cart = {
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this.updateBadges();
    this.renderDrawer();
  },

  getCoupon() {
    try {
      return JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  },

  setCoupon(coupon) {
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
    this.renderDrawer();
  },

  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existing = items.find(item => item.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity
      });
    }

    this.saveItems(items);
    if (window.showToast) {
      window.showToast(`Added "${product.name.substring(0, 24)}..." to cart!`, 'success');
    }
  },

  updateQuantity(productId, delta) {
    let items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      items = items.filter(i => i.id !== productId);
    }

    this.saveItems(items);
  },

  removeItem(productId) {
    let items = this.getItems();
    items = items.filter(i => i.id !== productId);
    this.saveItems(items);
    if (window.showToast) {
      window.showToast('Item removed from cart', 'info');
    }
  },

  clear() {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
    this.updateBadges();
    this.renderDrawer();
  },

  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const coupon = this.getCoupon();

    let discount = 0;
    if (coupon) {
      if (coupon.type === 'percentage') {
        discount = parseFloat((subtotal * 0.10).toFixed(2));
      } else if (coupon.type === 'shipping') {
        discount = 0; // free shipping handles shipping fee
      } else if (coupon.discount) {
        discount = parseFloat(coupon.discount);
      }
    }

    const shipping = subtotal > 150 || (coupon && coupon.type === 'shipping') || items.length === 0 ? 0.00 : 15.00;
    const total = Math.max(0, subtotal - discount + shipping);

    return {
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      coupon
    };
  },

  updateBadges() {
    const totals = this.getTotals();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
      badge.textContent = totals.count;
      badge.style.display = totals.count > 0 ? 'flex' : 'none';
    });
  },

  renderDrawer() {
    const listEl = document.getElementById('cartDrawerItems');
    if (!listEl) return;

    const items = this.getItems();
    const totals = this.getTotals();

    if (items.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🛍️</div>
          <p style="font-weight: 600; color: var(--text-primary);">Your cart is empty</p>
          <p style="font-size: 0.85rem; margin-top: 0.35rem;">Explore our catalog to add items!</p>
        </div>
      `;
    } else {
      listEl.innerHTML = items.map(item => `
        <div class="cart-item-row" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-controls">
              <div class="qty-stepper">
                <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
              </div>
              <button class="remove-item-btn" onclick="cart.removeItem('${item.id}')">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Update Drawer Summary Numbers
    const subtotalEl = document.getElementById('drawerSubtotal');
    const discountEl = document.getElementById('drawerDiscount');
    const shippingEl = document.getElementById('drawerShipping');
    const totalEl = document.getElementById('drawerTotal');
    const couponBoxEl = document.getElementById('drawerCouponBox');

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${totals.discount.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.total.toFixed(2)}`;

    // Coupon pill render
    if (couponBoxEl) {
      if (totals.coupon) {
        couponBoxEl.innerHTML = `
          <div class="applied-coupon-pill">
            <span>🏷️ Code: <strong>${totals.coupon.code}</strong> applied</span>
            <button onclick="cart.setCoupon(null)" style="background:none;border:none;color:inherit;cursor:pointer;font-weight:bold;">✕</button>
          </div>
        `;
      } else {
        couponBoxEl.innerHTML = `
          <div class="coupon-input-wrap">
            <input type="text" id="drawerCouponInput" placeholder="Try CODEALPHA10" autocomplete="off">
            <button class="coupon-apply-btn" onclick="cart.handleApplyCoupon()">Apply</button>
          </div>
        `;
      }
    }
  },

  async handleApplyCoupon() {
    const input = document.getElementById('drawerCouponInput');
    if (!input || !input.value.trim()) return;

    const totals = this.getTotals();
    if (totals.subtotal <= 0) {
      if (window.showToast) window.showToast('Add items to cart before applying coupon', 'error');
      return;
    }

    try {
      const res = await api.validateCoupon(input.value.trim(), totals.subtotal);
      if (res.success) {
        this.setCoupon(res);
        if (window.showToast) window.showToast(res.message, 'success');
      } else {
        if (window.showToast) window.showToast(res.message, 'error');
      }
    } catch (err) {
      if (window.showToast) window.showToast('Failed to validate coupon', 'error');
    }
  },

  openDrawer() {
    this.renderDrawer();
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
      overlay.classList.add('open');
      drawer.classList.add('open');
    }
  },

  closeDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay && drawer) {
      overlay.classList.remove('open');
      drawer.classList.remove('open');
    }
  }
};

// Auto init badges on load
document.addEventListener('DOMContentLoaded', () => {
  cart.updateBadges();
  
  // Attach drawer triggers
  const triggers = document.querySelectorAll('.cart-trigger-btn');
  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cart.openDrawer();
    });
  });

  const closeBtn = document.getElementById('cartDrawerClose');
  if (closeBtn) closeBtn.addEventListener('click', () => cart.closeDrawer());

  const overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) overlay.addEventListener('click', () => cart.closeDrawer());
});
