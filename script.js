const products = [
  {
    id: 'thrift-01',
    name: 'Vintage Levi’s Jacket',
    category: 'Outerwear',
    price: 180,
    origPrice: 520,
    image: 'product_image/levi.png',
    tag: 'NEW',
  },
  {
    id: 'thrift-02',
    name: 'Brown Leather Tote',
    category: 'Accessories',
    price: 250,
    origPrice: 680,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80',
    tag: 'BESTSELLER',
  },
  {
    id: 'thrift-03',
    name: 'Cropped Knit Sweater',
    category: 'Tops',
    price: 140,
    origPrice: 360,
    image: 'product_image/skitter.png',
    tag: 'TRENDY',
  },
  {
    id: 'thrift-04',
    name: 'Denim Mini Skirt',
    category: 'Bottoms',
    price: 130,
    origPrice: 360,
    image: 'product_image/skirt.png',
    tag: 'LIMITED',
  },
  {
    id: 'thrift-05',
    name: 'Textured Linen Dress',
    category: 'Dresses',
    price: 320,
    origPrice: 760,
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=900&q=80',
    tag: 'NEW',
  },
  {
    id: 'thrift-06',
    name: 'Retro Round Sunglasses',
    category: 'Accessories',
    price: 85,
    origPrice: 240,
    image: 'product_image/sunglasses.png',
    tag: 'BESTSELLER',
  },
  {
    id: 'thrift-07',
    name: 'Soft Ribbed Turtleneck',
    category: 'Tops',
    price: 155,
    origPrice: 420,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80',
    tag: 'COZY',
  },
  {
    id: 'thrift-08',
    name: 'Corduroy Bucket Hat',
    category: 'Accessories',
    price: 95,
    origPrice: 210,
    image: 'product_image/corduroy.png',
    tag: 'TRENDY',
  },
];

const cart = new Map();
const shippingFee = 80;
let activeDiscount = {
  code: null,
  amount: 0,
  label: '',
};

const selectors = {
  productsGrid: document.getElementById('products-grid'),
  cartCount: document.getElementById('cart-count'),
  cartHeaderCount: document.getElementById('cart-header-count'),
  cartItems: document.getElementById('cart-items'),
  cartEmpty: document.getElementById('cart-empty'),
  cartTotal: document.getElementById('cart-total'),
  cartOverlay: document.getElementById('cart-overlay'),
  cartSidebar: document.getElementById('cart-sidebar'),
  cartBtn: document.getElementById('cart-btn'),
  cartClose: document.getElementById('cart-close'),
  summaryItems: document.getElementById('summary-items'),
  summarySubtotal: document.getElementById('summary-subtotal'),
  summaryDiscount: document.getElementById('summary-discount'),
  summaryShipping: document.getElementById('summary-shipping'),
  summaryTotal: document.getElementById('summary-total'),
  discountRow: document.getElementById('discount-row'),
  leadForm: document.getElementById('lead-form'),
  leadSuccess: document.getElementById('lead-success'),
  successName: document.getElementById('success-name'),
  checkoutForm: document.getElementById('checkout-form'),
  couponInput: document.getElementById('co-coupon'),
  couponMsg: document.getElementById('coupon-msg'),
  applyCouponBtn: document.getElementById('apply-coupon'),
  thankYouModal: document.getElementById('thankyou-modal'),
  tyName: document.getElementById('ty-name'),
  tyEmail: document.getElementById('ty-email'),
  tyRef: document.getElementById('ty-ref'),
  tyReferralCode: document.getElementById('ty-referral-code'),
  tyClose: document.getElementById('ty-close'),
  tyCloseIcon: document.getElementById('ty-close-icon'),
  copyReferralBtn: document.getElementById('copy-referral'),
  checkoutBtn: document.getElementById('checkout-btn'),
  hamburger: document.getElementById('hamburger'),
  mobileMenu: document.getElementById('mobile-menu'),
  navHeader: document.getElementById('nav-header'),
};

function formatPeso(value) {
  return `₱${value.toLocaleString('en-PH')}`;
}

function getTotalItems() {
  let total = 0;
  cart.forEach(item => {
    total += item.qty;
  });
  return total;
}

function getSubtotal() {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.product.price * item.qty;
  });
  return subtotal;
}

function recalculateDiscount(subtotal) {
  if (!activeDiscount.code) {
    activeDiscount.amount = 0;
    return;
  }

  if (activeDiscount.code === 'HAVEN10') {
    activeDiscount.amount = Math.round(subtotal * 0.1);
  } else if (activeDiscount.code === 'FLASH15') {
    activeDiscount.amount = Math.round(subtotal * 0.15);
  } else {
    activeDiscount.amount = 0;
    activeDiscount.code = null;
  }
}

function renderProducts() {
  selectors.productsGrid.innerHTML = products
    .map(product => `
      <article class="product-card reveal">
        <div class="product-card__img">
          <span class="product-tag-label">${product.tag}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <p class="product-card__category">${product.category}</p>
          <h3 class="product-card__name">${product.name}</h3>
          <div class="product-card__price-row">
            <div>
              <span class="product-card__price">${formatPeso(product.price)}</span>
              <span class="product-card__orig-price">${formatPeso(product.origPrice)}</span>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">Add to bag</button>
          </div>
        </div>
      </article>
    `)
    .join('');
}

function updateCartUI() {
  const totalQty = getTotalItems();
  selectors.cartCount.textContent = totalQty;
  selectors.cartHeaderCount.textContent = `(${totalQty} item${totalQty === 1 ? '' : 's'})`;
  selectors.cartTotal.textContent = formatPeso(getSubtotal());
  selectors.cartEmpty.style.display = totalQty ? 'none' : 'block';

  renderCartItems();
  renderOrderSummary();
}

function renderCartItems() {
  if (!selectors.cartItems) return;
  selectors.cartItems.innerHTML = '';
  if (!cart.size) {
    selectors.cartItems.appendChild(selectors.cartEmpty);
    return;
  }

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.product.image}" alt="${item.product.name}" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-qty">Qty: ${item.qty}</div>
        <div class="cart-item-price">${formatPeso(item.product.price * item.qty)}</div>
      </div>
      <button class="cart-item-remove" type="button" data-product-id="${item.product.id}">Remove</button>
    `;
    selectors.cartItems.appendChild(li);
  });
}

function renderOrderSummary() {
  selectors.summaryItems.innerHTML = '';
  if (!cart.size) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'summary-empty';
    emptyItem.innerHTML = 'Your cart is empty. <a href="#products">Add items →</a>';
    selectors.summaryItems.appendChild(emptyItem);
  } else {
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'summary-item';
      li.innerHTML = `
        <img src="${item.product.image}" alt="${item.product.name}" />
        <div class="summary-item-info">
          <div class="summary-item-name">${item.product.name}</div>
          <div class="summary-item-qty">Qty: ${item.qty}</div>
        </div>
        <div class="summary-item-price">${formatPeso(item.product.price * item.qty)}</div>
      `;
      selectors.summaryItems.appendChild(li);
    });
  }

  const subtotal = getSubtotal();
  selectors.summarySubtotal.textContent = formatPeso(subtotal);

  recalculateDiscount(subtotal);

  if (activeDiscount.amount > 0) {
    selectors.discountRow.style.display = 'flex';
    selectors.summaryDiscount.textContent = `−${formatPeso(activeDiscount.amount)}`;
  } else {
    selectors.discountRow.style.display = 'none';
  }

  const shipping = subtotal > 0 ? shippingFee : 0;
  selectors.summaryShipping.textContent = formatPeso(shipping);

  const total = subtotal - activeDiscount.amount + shipping;
  selectors.summaryTotal.textContent = formatPeso(Math.max(total, 0));
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const current = cart.get(productId);
  if (current) {
    current.qty += 1;
  } else {
    cart.set(productId, { product, qty: 1 });
  }

  selectors.cartCount.classList.add('pulse');
  window.setTimeout(() => selectors.cartCount.classList.remove('pulse'), 300);
  updateCartUI();
}

function removeFromCart(productId) {
  if (!cart.has(productId)) return;
  cart.delete(productId);
  updateCartUI();
}

function openCart() {
  selectors.cartSidebar.classList.add('open');
  selectors.cartOverlay.classList.add('open');
  selectors.cartSidebar.setAttribute('aria-hidden', 'false');
  selectors.cartOverlay.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  selectors.cartSidebar.classList.remove('open');
  selectors.cartOverlay.classList.remove('open');
  selectors.cartSidebar.setAttribute('aria-hidden', 'true');
  selectors.cartOverlay.setAttribute('aria-hidden', 'true');
}

function toggleMobileMenu() {
  const open = selectors.hamburger.classList.toggle('open');
  selectors.hamburger.setAttribute('aria-expanded', open);
  selectors.mobileMenu.classList.toggle('open', open);
}

function updateHeaderOnScroll() {
  const scrolled = window.scrollY > 50;
  selectors.navHeader.classList.toggle('scrolled', scrolled);
}

function applyCouponCode() {
  const code = selectors.couponInput.value.trim().toUpperCase();
  const subtotal = getSubtotal();

  if (!subtotal) {
    selectors.couponMsg.textContent = 'Add items to your cart before applying a coupon.';
    selectors.couponMsg.className = 'coupon-msg invalid';
    return;
  }

  if (!code) {
    selectors.couponMsg.textContent = 'Enter a coupon code to apply.';
    selectors.couponMsg.className = 'coupon-msg invalid';
    return;
  }

  if (code === 'HAVEN10' || code === 'FLASH15') {
    activeDiscount.code = code;
    activeDiscount.label = code === 'HAVEN10' ? '10% off' : '15% off';
    recalculateDiscount(subtotal);
    selectors.couponMsg.textContent = code === 'HAVEN10'
      ? 'Coupon applied — 10% off your order!'
      : 'Nice! FLASH15 gives you 15% off.';
    selectors.couponMsg.className = 'coupon-msg valid';
  } else {
    activeDiscount = { code: null, amount: 0, label: '' };
    selectors.couponMsg.textContent = 'That coupon code is not valid. Try HAVEN10 or FLASH15.';
    selectors.couponMsg.className = 'coupon-msg invalid';
  }

  renderOrderSummary();
}

function validateField(input, errorElement, message) {
  if (!input.checkValidity()) {
    errorElement.textContent = message || input.validationMessage;
    input.classList.add('has-error');
    return false;
  }

  errorElement.textContent = '';
  input.classList.remove('has-error');
  return true;
}

function validateLeadForm() {
  const nameInput = document.getElementById('lead-name');
  const emailInput = document.getElementById('lead-email');
  const nameError = document.getElementById('lead-name-error');
  const emailError = document.getElementById('lead-email-error');

  const validName = validateField(nameInput, nameError, 'Enter your first name.');
  const validEmail = validateField(emailInput, emailError, 'Enter a valid email address.');

  return validName && validEmail;
}

function handleLeadFormSubmit(event) {
  event.preventDefault();
  if (!validateLeadForm()) return;

  const name = document.getElementById('lead-name').value.trim();
  selectors.successName.textContent = name.split(' ')[0] || name;
  selectors.leadSuccess.hidden = false;
  selectors.leadForm.hidden = true;
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (!cart.size) {
    window.alert('Your cart is empty. Add items before you place your order.');
    return;
  }

  const fields = [
    { id: 'co-fname', msg: 'Enter your first name.' },
    { id: 'co-lname', msg: 'Enter your last name.' },
    { id: 'co-email', msg: 'Enter a valid email address.' },
    { id: 'co-phone', msg: 'Enter a valid phone number.' },
    { id: 'co-address', msg: 'Enter your full delivery address.' },
  ];

  const allValid = fields.every(field => {
    const input = document.getElementById(field.id);
    const error = document.getElementById(`${field.id}-error`);
    return validateField(input, error, field.msg);
  });

  if (!allValid) return;

  const name = document.getElementById('co-fname').value.trim();
  const email = document.getElementById('co-email').value.trim();
  showThankYouModal(name, email);
  emptyCart();
  selectors.checkoutForm.reset();
  selectors.couponMsg.textContent = '';
  activeDiscount = { code: null, amount: 0, label: '' };
  renderOrderSummary();
}

function showThankYouModal(name, email) {
  selectors.tyName.textContent = name.split(' ')[0] || name;
  selectors.tyEmail.textContent = email;
  selectors.tyRef.textContent = `TH-${Math.floor(Math.random() * 900000 + 100000)}`;
  selectors.tyReferralCode.textContent = `HAVEN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  selectors.thankYouModal.hidden = false;
}

function hideThankYouModal() {
  selectors.thankYouModal.hidden = true;
}

function emptyCart() {
  cart.clear();
  updateCartUI();
}

function copyReferralCode() {
  const code = selectors.tyReferralCode.textContent.trim();
  if (!navigator.clipboard) {
    window.prompt('Copy this code:', code);
    return;
  }

  navigator.clipboard.writeText(code).then(() => {
    selectors.copyReferralBtn.textContent = 'Copied!';
    setTimeout(() => {
      selectors.copyReferralBtn.textContent = 'Copy code';
    }, 1500);
  }).catch(() => {
    window.prompt('Copy this code:', code);
  });
}

function setupEventListeners() {
  selectors.productsGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    addToCart(button.dataset.productId);
  });

  selectors.cartBtn.addEventListener('click', openCart);
  selectors.cartClose.addEventListener('click', closeCart);
  selectors.cartOverlay.addEventListener('click', closeCart);
  selectors.cartItems.addEventListener('click', event => {
    const button = event.target.closest('[data-product-id]');
    if (!button) return;
    removeFromCart(button.dataset.productId);
  });

  selectors.hamburger.addEventListener('click', toggleMobileMenu);
  selectors.mobileMenu.addEventListener('click', () => {
    if (selectors.mobileMenu.classList.contains('open')) toggleMobileMenu();
  });

  window.addEventListener('scroll', () => {
    updateHeaderOnScroll();
    revealOnScroll();
  });

  selectors.leadForm.addEventListener('submit', handleLeadFormSubmit);
  selectors.applyCouponBtn.addEventListener('click', applyCouponCode);
  selectors.checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  selectors.tyClose.addEventListener('click', hideThankYouModal);
  selectors.tyCloseIcon?.addEventListener('click', hideThankYouModal);
  selectors.thankYouModal.addEventListener('click', event => {
    if (event.target === selectors.thankYouModal) {
      hideThankYouModal();
    }
  });
  selectors.copyReferralBtn.addEventListener('click', copyReferralCode);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !selectors.thankYouModal.hidden) {
      hideThankYouModal();
    }
  });
}

function revealOnScroll() {
  const revealItems = document.querySelectorAll('.reveal');
  const revealPoint = window.innerHeight * 0.85;
  revealItems.forEach(item => {
    const itemTop = item.getBoundingClientRect().top;
    if (itemTop < revealPoint) {
      item.classList.add('visible');
    }
  });
}

function startCountdown() {
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function updateCountdown() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(end - now, 0);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function initialize() {
  renderProducts();
  updateCartUI();
  setupEventListeners();
  updateHeaderOnScroll();
  startCountdown();
  revealOnScroll();
}

initialize();
