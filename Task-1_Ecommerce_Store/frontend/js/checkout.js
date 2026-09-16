/**
 * CodeAlpha E-Commerce Store — Checkout & Order Flow Logic
 * Author: Veernarayan | CodeAlpha Full Stack Internship Task 1
 */

const checkout = {
  currentStep: 1,
  selectedPayment: 'card',

  init() {
    this.renderCartTable();
    this.bindEvents();
    this.checkPreAuth();
  },

  checkPreAuth() {
    const user = auth.getUser();
    if (user) {
      const nameInput = document.getElementById('shipFullName');
      const emailInput = document.getElementById('shipEmail');
      if (nameInput && !nameInput.value) nameInput.value = user.name;
      if (emailInput && !emailInput.value) emailInput.value = user.email;
    }
  },

  fillDemoShipping() {
    document.getElementById('shipFullName').value = 'Veernarayan Intern';
    document.getElementById('shipEmail').value = 'demo@codealpha.com';
    document.getElementById('shipPhone').value = '+91 98765 43210';
    document.getElementById('shipStreet').value = '42 Innovation Boulevard, Tech Park';
    document.getElementById('shipCity').value = 'Bengaluru';
    document.getElementById('shipState').value = 'Karnataka';
    document.getElementById('shipPincode').value = '560100';
    window.showToast('Demo shipping address filled!', 'info');
  },

  bindEvents() {
    // Payment method switch
    const paymentMethods = document.querySelectorAll('.payment-option-card');
    paymentMethods.forEach(card => {
      card.addEventListener('click', () => {
        paymentMethods.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedPayment = card.getAttribute('data-method');

        const cardDetailsBox = document.getElementById('cardPaymentFields');
        const upiDetailsBox = document.getElementById('upiPaymentFields');
        if (this.selectedPayment === 'card') {
          if (cardDetailsBox) cardDetailsBox.style.display = 'block';
          if (upiDetailsBox) upiDetailsBox.style.display = 'none';
        } else if (this.selectedPayment === 'upi') {
          if (cardDetailsBox) cardDetailsBox.style.display = 'none';
          if (upiDetailsBox) upiDetailsBox.style.display = 'block';
        } else {
          if (cardDetailsBox) cardDetailsBox.style.display = 'none';
          if (upiDetailsBox) upiDetailsBox.style.display = 'none';
        }
      });
    });

    // Step 1 -> Step 2 button
    const toShippingBtn = document.getElementById('btnProceedToShipping');
    if (toShippingBtn) {
      toShippingBtn.addEventListener('click', () => {
        const items = cart.getItems();
        if (items.length === 0) {
          window.showToast('Your cart is empty! Add items first.', 'error');
          return;
        }
        this.setStep(2);
      });
    }

    // Step 2 -> Step 3 button
    const toPaymentBtn = document.getElementById('btnProceedToPayment');
    if (toPaymentBtn) {
      toPaymentBtn.addEventListener('click', () => {
        if (!this.validateShippingForm()) return;
        this.setStep(3);
      });
    }

    // Place Order Button
    const placeOrderBtn = document.getElementById('btnPlaceOrder');
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener('click', () => this.handlePlaceOrder());
    }
  },

  setStep(stepNumber) {
    this.currentStep = stepNumber;

    // Toggle step panes
    document.querySelectorAll('.checkout-step-pane').forEach((pane, idx) => {
      pane.style.display = (idx + 1 === stepNumber) ? 'block' : 'none';
    });

    // Update indicator pills
    document.querySelectorAll('.step-indicator-item').forEach((item, idx) => {
      if (idx + 1 < stepNumber) {
        item.classList.add('completed');
        item.classList.remove('active');
      } else if (idx + 1 === stepNumber) {
        item.classList.add('active');
        item.classList.remove('completed');
      } else {
        item.classList.remove('active', 'completed');
      }
    });

    window.scrollTo({ top: 100, behavior: 'smooth' });
  },

  validateShippingForm() {
    const fullName = document.getElementById('shipFullName').value.trim();
    const email = document.getElementById('shipEmail').value.trim();
    const phone = document.getElementById('shipPhone').value.trim();
    const street = document.getElementById('shipStreet').value.trim();
    const city = document.getElementById('shipCity').value.trim();
    const pincode = document.getElementById('shipPincode').value.trim();

    if (!fullName || !email || !phone || !street || !city || !pincode) {
      window.showToast('Please fill out all required shipping fields', 'error');
      return false;
    }

    if (!email.includes('@')) {
      window.showToast('Please enter a valid email address', 'error');
      return false;
    }

    return true;
  },

  renderCartTable() {
    const items = cart.getItems();
    const tableBody = document.getElementById('cartTableBody');
    const emptyMsg = document.getElementById('cartEmptyMessage');
    const checkoutContent = document.getElementById('checkoutMainContent');

    if (!tableBody) return;

    if (items.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (checkoutContent) checkoutContent.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (checkoutContent) checkoutContent.style.display = 'grid';

    tableBody.innerHTML = items.map(item => `
      <tr class="cart-table-row">
        <td class="table-prod-cell">
          <img src="${item.image}" alt="${item.name}" class="table-prod-img">
          <div>
            <div class="table-prod-title">${item.name}</div>
            <div class="table-prod-cat">${item.category || ''}</div>
          </div>
        </td>
        <td class="table-price-cell">$${item.price.toFixed(2)}</td>
        <td class="table-qty-cell">
          <div class="qty-stepper">
            <button class="qty-btn" onclick="checkout.handleQtyChange('${item.id}', -1)">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="checkout.handleQtyChange('${item.id}', 1)">+</button>
          </div>
        </td>
        <td class="table-subtotal-cell">$${(item.price * item.quantity).toFixed(2)}</td>
        <td class="table-action-cell">
          <button class="remove-btn-icon" onclick="checkout.handleRemoveItem('${item.id}')" title="Delete item">✕</button>
        </td>
      </tr>
    `).join('');

    this.updateSummaryWidgets();
  },

  handleQtyChange(id, delta) {
    cart.updateQuantity(id, delta);
    this.renderCartTable();
  },

  handleRemoveItem(id) {
    cart.removeItem(id);
    this.renderCartTable();
  },

  updateSummaryWidgets() {
    const totals = cart.getTotals();
    const subtotalEls = document.querySelectorAll('.checkout-subtotal-val');
    const discountEls = document.querySelectorAll('.checkout-discount-val');
    const shippingEls = document.querySelectorAll('.checkout-shipping-val');
    const totalEls = document.querySelectorAll('.checkout-total-val');

    subtotalEls.forEach(el => el.textContent = `$${totals.subtotal.toFixed(2)}`);
    discountEls.forEach(el => el.textContent = `-$${totals.discount.toFixed(2)}`);
    shippingEls.forEach(el => el.textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`);
    totalEls.forEach(el => el.textContent = `$${totals.total.toFixed(2)}`);
  },

  async handlePlaceOrder() {
    const btn = document.getElementById('btnPlaceOrder');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Processing Order...</span>`;
    }

    const totals = cart.getTotals();
    const items = cart.getItems();

    const shippingAddress = {
      fullName: document.getElementById('shipFullName').value.trim(),
      email: document.getElementById('shipEmail').value.trim(),
      phone: document.getElementById('shipPhone').value.trim(),
      street: document.getElementById('shipStreet').value.trim(),
      city: document.getElementById('shipCity').value.trim(),
      state: document.getElementById('shipState').value.trim(),
      pincode: document.getElementById('shipPincode').value.trim()
    };

    let paymentMethodName = 'Credit / Debit Card';
    if (this.selectedPayment === 'upi') paymentMethodName = 'UPI / NetBanking';
    if (this.selectedPayment === 'cod') paymentMethodName = 'Cash on Delivery';

    try {
      const orderPayload = {
        items,
        shippingAddress,
        paymentMethod: paymentMethodName,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        // Clear local cart
        cart.clear();
        this.showOrderConfirmation(res.order);
      } else {
        window.showToast(res.message || 'Failed to place order', 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Complete Purchase</span>`;
        }
      }
    } catch (err) {
      window.showToast('Server connection error', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Complete Purchase</span>`;
      }
    }
  },

  showOrderConfirmation(order) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    modal.classList.add('open');
    document.getElementById('confirmOrderId').textContent = order.id;
    document.getElementById('confirmOrderDate').textContent = new Date(order.date).toLocaleDateString();
    document.getElementById('confirmOrderTotal').textContent = `$${order.total.toFixed(2)}`;
    document.getElementById('confirmOrderPayMethod').textContent = order.paymentMethod;
    document.getElementById('confirmOrderRecipient').textContent = `${order.shippingAddress.fullName} (${order.shippingAddress.city})`;

    const itemsListEl = document.getElementById('confirmOrderItems');
    if (itemsListEl) {
      itemsListEl.innerHTML = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; padding: 0.4rem 0; border-bottom: 1px solid var(--border-subtle);">
          <span>${item.quantity}x ${item.name}</span>
          <span style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  checkout.init();
});
