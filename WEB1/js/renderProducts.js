/**
 * renderProducts.js
 * Yêu cầu:
 * - Product.js phải được load trước
 * - productData.js phải được load trước (tạo biến global `products`)
 * - Thứ tự load: Product.js -> productData.js -> renderProducts.js
 */

(function () {
  // --- Helpers ---
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function formatPrice(v) {
    if (v == null || v === '') return '';
    return new Intl.NumberFormat('vi-VN').format(v) + '₫';
  }

  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Elements ---
  const productGrid = $('.product-grid');
  const filterBtns = $$('.filter-btn');
  const sortSelect = $('.sort-select');
  const loadMoreBtn = $('.load-more-btn');
  const cartCountEl = $('.cart-count');

  // modal elements
  const modal = $('#quick-view-modal');
  const modalImg = $('#modal-img');
  const modalName = $('#modal-name');
  const modalRating = $('#modal-rating');
  const modalPrice = $('#modal-price');
  const modalAddBtn = $('#modal-add-to-cart');

  if (!productGrid) {
    console.error('renderProducts.js: .product-grid not found in DOM');
    return;
  }

  // --- State ---
  let currentCategory = 'all';
  let currentSort = '';
  let perPage = 6;
  let currentPage = 1;
  let filtered = Array.isArray(products) ? products.slice() : [];
  let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');

  // --- Create product card ---
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    // Sử dụng phương thức của Product class
    const badgeText = product.getBadgeText();
    const badgeHtml = product.badge
      ? `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(badgeText)}</div>`
      : '';

    const imgHtml = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" class="product-img">`
      : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

    const priceHtml = product.oldPrice
      ? `<span class="current-price">${product.getFormattedPrice()}</span> <span class="old-price">${product.getFormattedOldPrice()}</span>`
      : `<span class="current-price">${product.getFormattedPrice()}</span>`;

    const ratingHtml = `<div class="product-rating"><div class="stars">${product.renderStars()}</div><span class="rating-text">(${product.ratingCount || 0})</span></div>`;

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-image">
        ${imgHtml}
        <div class="product-overlay">
          <button type="button" class="quick-view" data-id="${product.id}">Xem nhanh</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        ${ratingHtml}
        <div class="product-price">
          ${priceHtml}
        </div>
        <button type="button" class="add-to-cart" data-id="${product.id}">
          <i class="fas fa-cart-plus" aria-hidden="true"></i> Thêm vào giỏ
        </button>
      </div>
    `;
    return card;
  }

  // --- Render functions ---
  function renderList() {
    productGrid.innerHTML = '';
    const end = perPage * currentPage;
    const slice = filtered.slice(0, end);

    if (slice.length === 0) {
      productGrid.innerHTML = '<p class="no-products">Không có sản phẩm phù hợp.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    slice.forEach(p => frag.appendChild(createProductCard(p)));
    productGrid.appendChild(frag);

    // toggle load-more
    if (loadMoreBtn) {
      if (filtered.length > end) loadMoreBtn.style.display = 'block';
      else loadMoreBtn.style.display = 'none';
    }
  }

  function applyFilters() {
    // filter
    if (!products || !Array.isArray(products)) {
      filtered = [];
    } else if (currentCategory === 'all') {
      filtered = products.slice();
    } else {
      filtered = products.filter(p => p.category === currentCategory);
    }

    // sort
    if (currentSort === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === 'newest') {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (currentSort === 'best-seller') {
      filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }

    currentPage = 1;
    renderList();
  }

  // --- Cart helpers ---
  function updateCartCount() {
    const count = cart.reduce((s, item) => s + (item.qty || 1), 0);
    if (cartCountEl) cartCountEl.textContent = count;
    localStorage.setItem('cart_shoestore', JSON.stringify(cart));
  }

  function addToCart(productId, qty = 1) {
    const id = Number(productId);
    const product = products.find(x => x.id === id);
    if (!product) return;
    
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty = (existing.qty || 1) + qty;
    } else {
      cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        qty 
      });
    }
    updateCartCount();
  }

  // --- Quick view (modal) ---
  function openQuickView(productId) {
    const id = Number(productId);
    const product = products.find(x => x.id === id);
    if (!product || !modal) return;

    // populate modal using Product class methods
    if (modalImg) {
      modalImg.src = product.img || './img/NAME.avif';
      modalImg.alt = product.name;
    }
    if (modalName) {
      modalName.textContent = product.name;
    }
    if (modalRating) {
      modalRating.innerHTML = `${product.renderStars()} <span class="rating-text">(${product.ratingCount || 0})</span>`;
    }
    if (modalPrice) {
      const oldPriceHtml = product.oldPrice 
        ? `<span class="old-price">${product.getFormattedOldPrice()}</span>` 
        : '';
      modalPrice.innerHTML = `<strong>${product.getFormattedPrice()}</strong> ${oldPriceHtml}`;
    }

    // set add-to-cart dataset
    if (modalAddBtn) modalAddBtn.dataset.id = id;

    // show modal
    modal.classList.add('open');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeQuickView() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  // --- Event listeners ---
  // Delegation for quick-view and add-to-cart inside grid
  productGrid.addEventListener('click', (e) => {
    const qv = e.target.closest('.quick-view');
    if (qv) {
      const id = qv.dataset.id;
      openQuickView(id);
      return;
    }

    const add = e.target.closest('.add-to-cart');
    if (add) {
      const id = add.dataset.id;
      addToCart(id, 1);
      // small UI feedback
      add.classList.add('added');
      setTimeout(() => add.classList.remove('added'), 600);
      return;
    }
  });

  // filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.filter || 'all';
      applyFilters();
    });
  });

  // sort
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value || '';
      applyFilters();
    });
  }

  // load more
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderList();
    });
  }

  // modal close handlers
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
    modal.addEventListener('click', (e) => {
      if (e.target.closest('.close-btn')) closeQuickView();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQuickView();
    });
  }

  // modal add-to-cart button
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', function () {
      const id = this.dataset.id;
      if (id) {
        addToCart(id, 1);
        closeQuickView();
      }
    });
  }

  // --- Init ---
  (function init() {
    if (!Array.isArray(products)) {
      productGrid.innerHTML = '<p class="no-products">Không có sản phẩm.</p>';
      return;
    }
    filtered = products.slice();
    updateCartCount();
    renderList();
  })();

})();