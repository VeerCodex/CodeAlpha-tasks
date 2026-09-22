/**
 * CodeAlpha E-Commerce Store — Main Storefront App Logic
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 1
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
  if (type === 'success') icon = '✅';
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

// Storefront Application State
const app = {
  activeCategory: 'All',
  searchQuery: '',
  maxPrice: 500,
  inStockOnly: false,
  sortBy: 'featured',
  currentModalProduct: null,
  selectedModalQty: 1,

  async init() {
    await this.loadCategories();
    this.bindEvents();
    await this.loadProducts();
  },

  async loadCategories() {
    const container = document.getElementById('categoryChipsBar');
    if (!container) return;

    try {
      const res = await api.getCategories();
      if (res.success && res.categories) {
        container.innerHTML = res.categories.map(cat => `
          <button class="category-chip ${cat === this.activeCategory ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `).join('');

        container.querySelectorAll('.category-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            container.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.activeCategory = btn.getAttribute('data-cat');
            this.loadProducts();
          });
        });
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  },

  filterByCategory(categoryName) {
    this.activeCategory = categoryName;
    const chips = document.querySelectorAll('.category-chip');
    chips.forEach(chip => {
      if (chip.getAttribute('data-cat') === categoryName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    this.loadProducts();
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  },

  bindEvents() {
    // Search input (both nav search and catalog search if present)
    const searchInputs = document.querySelectorAll('.search-input');
    let debounceTimer;
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadProducts();
        }, 300);
      });
    });

    // Price Slider
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceVal = document.getElementById('priceRangeValue');
    if (priceSlider && priceVal) {
      priceSlider.addEventListener('input', (e) => {
        this.maxPrice = e.target.value;
        priceVal.textContent = `$${this.maxPrice}`;
      });
      priceSlider.addEventListener('change', () => {
        this.loadProducts();
      });
    }

    // In-Stock Checkbox
    const stockCheckbox = document.getElementById('stockOnlyCheckbox');
    if (stockCheckbox) {
      stockCheckbox.addEventListener('change', (e) => {
        this.inStockOnly = e.target.checked;
        this.loadProducts();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.loadProducts();
      });
    }

    // Modal Close
    const modalClose = document.getElementById('productModalClose');
    const modalOverlay = document.getElementById('productModalOverlay');
    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
    }
  },

  async loadProducts() {
    const grid = document.getElementById('productGrid');
    const countBadge = document.getElementById('productsCountBadge');
    if (!grid) return;

    // Show skeletons while loading
    grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="product-card" style="min-height: 380px;">
        <div class="skeleton" style="height: 240px; width: 100%;"></div>
        <div style="padding: 1.25rem;">
          <div class="skeleton" style="height: 12px; width: 40%; margin-bottom: 0.5rem;"></div>
          <div class="skeleton" style="height: 18px; width: 85%; margin-bottom: 0.75rem;"></div>
          <div class="skeleton" style="height: 14px; width: 30%; margin-bottom: 1.5rem;"></div>
          <div class="skeleton" style="height: 30px; width: 100%;"></div>
        </div>
      </div>
    `).join('');

    try {
      const res = await api.getProducts({
        category: this.activeCategory,
        search: this.searchQuery,
        maxPrice: this.maxPrice,
        inStock: this.inStockOnly,
        sort: this.sortBy
      });

      if (res.success) {
        if (countBadge) {
          countBadge.textContent = `Showing ${res.products.length} products`;
        }

        if (res.products.length === 0) {
          grid.innerHTML = `
            <div class="empty-catalog">
              <div class="empty-catalog-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search criteria or price filters.</p>
              <button class="btn-secondary" style="margin-top: 1rem;" onclick="app.resetFilters()">Reset Filters</button>
            </div>
          `;
          return;
        }

        grid.innerHTML = res.products.map(prod => this.renderProductCard(prod)).join('');
      }
    } catch (err) {
      grid.innerHTML = `<div class="empty-catalog"><p>Failed to load products. Please ensure the server is running.</p></div>`;
    }
  },

  renderProductCard(prod) {
    let badgeHtml = '';
    if (prod.badge) {
      const badgeClass = `badge-${prod.badge.toLowerCase()}`;
      badgeHtml = `<span class="badge-corner ${badgeClass}">${prod.badge}</span>`;
    }

    const discountPct = prod.originalPrice 
      ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) 
      : 0;

    return `
      <div class="product-card" data-id="${prod.id}">
        <div class="product-thumb-wrap">
          ${badgeHtml}
          <button class="wishlist-heart-btn" title="Add to Wishlist" onclick="this.classList.toggle('active'); event.stopPropagation();">
            ♥
          </button>
          <img src="${prod.image}" alt="${prod.name}" class="product-thumb" loading="lazy">
          <button class="quick-view-overlay-btn" onclick="app.openModal('${prod.id}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Quick View
          </button>
        </div>

        <div class="product-body">
          <span class="product-category-label">${prod.category}</span>
          <h3 class="product-title" title="${prod.name}">
            <a href="javascript:void(0)" onclick="app.openModal('${prod.id}')">${prod.name}</a>
          </h3>

          <div class="product-rating-wrap">
            <div class="rating-pill-green">
              <span>★</span> ${prod.rating.toFixed(1)}
            </div>
            <span class="review-count-text">(${prod.reviewCount.toLocaleString()})</span>
            <div class="assured-badge-tag">
              <span class="gold-star">✦</span> Assured
            </div>
          </div>

          <div class="product-price-row">
            <span class="current-price">$${prod.price.toFixed(2)}</span>
            ${prod.originalPrice ? `<span class="original-price">$${prod.originalPrice.toFixed(2)}</span>` : ''}
            ${discountPct ? `<span class="discount-percentage">${discountPct}% off</span>` : ''}
          </div>

          <div class="delivery-timeline-text">
            ⚡ <strong>FREE Delivery</strong> by Tomorrow
          </div>

          <div class="product-footer">
            <button class="btn-card-cart" onclick="app.handleAddToCart('${prod.id}', event)">
              Add to Cart
            </button>
            <button class="btn-card-buy" onclick="app.handleBuyNow('${prod.id}', event)">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async handleAddToCart(productId, e) {
    if (e) e.stopPropagation();
    try {
      const res = await api.getProductById(productId);
      if (res.success && res.product) {
        cart.addItem(res.product, 1);
      }
    } catch (err) {
      window.showToast('Could not add to cart', 'error');
    }
  },

  async handleBuyNow(productId, e) {
    if (e) e.stopPropagation();
    try {
      const res = await api.getProductById(productId);
      if (res.success && res.product) {
        cart.addItem(res.product, 1);
        cart.openDrawer();
      }
    } catch (err) {
      window.showToast('Could not process order', 'error');
    }
  },

  async openModal(productId) {
    const modalOverlay = document.getElementById('productModalOverlay');
    const modalBody = document.getElementById('modalProductContent');
    if (!modalOverlay || !modalBody) return;

    modalOverlay.classList.add('open');
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
        <div class="skeleton" style="width: 80px; height: 80px; margin: 0 auto 1rem; border-radius: 50%;"></div>
        <p>Loading product details...</p>
      </div>
    `;

    try {
      const res = await api.getProductById(productId);
      if (res.success && res.product) {
        this.currentModalProduct = res.product;
        this.selectedModalQty = 1;
        this.renderModalContent(res.product);
      }
    } catch (err) {
      modalBody.innerHTML = `<p style="padding: 2rem; color: var(--accent-danger);">Error loading details.</p>`;
    }
  },

  renderModalContent(prod) {
    const modalBody = document.getElementById('modalProductContent');
    if (!modalBody) return;

    const images = prod.images && prod.images.length ? prod.images : [prod.image];
    const specsList = prod.specs 
      ? Object.entries(prod.specs).map(([k, v]) => `
          <div class="specs-row">
            <span class="specs-key">${k}</span>
            <span class="specs-val">${v}</span>
          </div>
        `).join('')
      : '';

    const reviewsList = prod.reviews && prod.reviews.length
      ? prod.reviews.map(r => `
          <div class="review-item-card">
            <div class="review-header">
              <span class="review-user-name">${r.user}</span>
              <span class="review-date">${r.date} • <strong style="color:#fbbf24;">★ ${r.rating}</strong></span>
            </div>
            <p class="review-body-text">${r.comment}</p>
          </div>
        `).join('')
      : `<p style="color: var(--text-muted); font-size: 0.85rem;">No reviews yet. Be the first to review!</p>`;

    modalBody.innerHTML = `
      <div class="modal-content-grid">
        <!-- Gallery -->
        <div class="modal-gallery-wrap">
          <img id="modalMainImg" src="${images[0]}" alt="${prod.name}" class="modal-main-img">
          <div class="modal-thumbs-row">
            ${images.map((img, idx) => `
              <img src="${img}" alt="thumbnail" class="modal-thumb-mini ${idx === 0 ? 'active' : ''}" onclick="app.switchModalImage('${img}', this)">
            `).join('')}
          </div>
        </div>

        <!-- Details -->
        <div class="modal-details-wrap">
          <span class="product-category-label">${prod.category}</span>
          <h2 style="font-size: 1.6rem; margin-bottom: 0.5rem;">${prod.name}</h2>

          <div class="product-rating" style="margin-bottom: 1rem;">
            <span class="stars-solid">★★★★★</span>
            <span class="rating-num">${prod.rating.toFixed(1)}</span>
            <span class="review-count">(${prod.reviewCount} customer reviews)</span>
          </div>

          <div class="price-block" style="margin-bottom: 1.25rem;">
            <span class="current-price" style="font-size: 1.8rem; color: var(--text-highlight);">$${prod.price.toFixed(2)}</span>
            ${prod.originalPrice ? `<span class="original-price" style="font-size: 0.95rem;">MSRP: $${prod.originalPrice.toFixed(2)}</span>` : ''}
          </div>

          <div class="modal-stock-indicator">
            <span class="pulse-dot"></span>
            ${prod.stock > 0 ? `In Stock (${prod.stock} units ready to ship)` : `<span style="color:var(--accent-danger);">Out of Stock</span>`}
          </div>

          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 1rem 0;">
            ${prod.description}
          </p>

          ${specsList ? `<div class="modal-specs-table">${specsList}</div>` : ''}

          <!-- Quantity & Add to Cart -->
          <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
            <div class="qty-stepper" style="padding: 0.2rem;">
              <button class="qty-btn" onclick="app.updateModalQty(-1)">-</button>
              <span id="modalQtyVal" class="qty-value">1</span>
              <button class="qty-btn" onclick="app.updateModalQty(1)">+</button>
            </div>
            <button class="btn-primary" style="flex: 1;" onclick="app.addModalProductToCart()">
              Add to Shopping Cart
            </button>
          </div>
        </div>
      </div>

      <!-- Customer Reviews & Add Review -->
      <div class="reviews-container">
        <h3 class="reviews-title">Verified Customer Reviews (${prod.reviews ? prod.reviews.length : 0})</h3>
        <div class="reviews-list">
          ${reviewsList}
        </div>

        <div class="review-form-wrap">
          <h4>Leave a Review for this Product</h4>
          <div class="form-rating-select" id="ratingStarsPicker">
            <span data-val="1">★</span>
            <span data-val="2">★</span>
            <span data-val="3">★</span>
            <span data-val="4">★</span>
            <span data-val="5" style="color:#fbbf24;">★</span>
          </div>
          <textarea id="modalReviewText" class="review-textarea" placeholder="Share your experience with this product..."></textarea>
          <button class="btn-secondary" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;" onclick="app.submitProductReview('${prod.id}')">
            Submit Review
          </button>
        </div>
      </div>
    `;

    this.initRatingPicker();
  },

  switchModalImage(src, thumbEl) {
    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.modal-thumb-mini').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  updateModalQty(delta) {
    this.selectedModalQty = Math.max(1, this.selectedModalQty + delta);
    const qtyValEl = document.getElementById('modalQtyVal');
    if (qtyValEl) qtyValEl.textContent = this.selectedModalQty;
  },

  addModalProductToCart() {
    if (!this.currentModalProduct) return;
    cart.addItem(this.currentModalProduct, this.selectedModalQty);
    this.closeModal();
    cart.openDrawer();
  },

  selectedRatingValue: 5,
  initRatingPicker() {
    const picker = document.getElementById('ratingStarsPicker');
    if (!picker) return;
    const stars = picker.querySelectorAll('span');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        this.selectedRatingValue = parseInt(star.getAttribute('data-val'));
        stars.forEach(s => {
          const val = parseInt(s.getAttribute('data-val'));
          s.style.color = val <= this.selectedRatingValue ? '#fbbf24' : 'var(--text-muted)';
        });
      });
    });
  },

  async submitProductReview(productId) {
    const textEl = document.getElementById('modalReviewText');
    if (!textEl || !textEl.value.trim()) {
      window.showToast('Please enter your review comments', 'error');
      return;
    }

    try {
      const res = await api.submitReview(productId, {
        rating: this.selectedRatingValue,
        comment: textEl.value.trim()
      });

      if (res.success) {
        window.showToast('Review submitted successfully!', 'success');
        this.openModal(productId); // Reload modal to show newly added review
      } else {
        window.showToast(res.message, 'error');
      }
    } catch (err) {
      window.showToast('Failed to post review', 'error');
    }
  },

  closeModal() {
    const modalOverlay = document.getElementById('productModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('open');
  },

  resetFilters() {
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.maxPrice = 500;
    this.inStockOnly = false;
    this.sortBy = 'featured';

    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';

    const priceSlider = document.getElementById('priceRangeSlider');
    const priceVal = document.getElementById('priceRangeValue');
    if (priceSlider) priceSlider.value = 500;
    if (priceVal) priceVal.textContent = '$500';

    const stockCheckbox = document.getElementById('stockOnlyCheckbox');
    if (stockCheckbox) stockCheckbox.checked = false;

    this.loadCategories();
    this.loadProducts();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
