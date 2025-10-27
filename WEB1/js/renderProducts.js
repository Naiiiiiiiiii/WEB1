/**
 * renderProducts.js
 * Yêu cầu:
 * - Product.js phải được load trước
 * - window.products là mảng Product hoặc object có trường cần thiết
 */

(function () {
  // --- Helpers ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function escapeHtml(str = "") {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Elements ---
  const productGrid = $(".product-grid");
  const filterBtns = $$(".filter-btn");
  const sortSelect = $(".sort-select");
  const loadMoreBtn = $(".load-more-btn");
  const cartCountEl = $(".cart-count");

  // modal elements
  const modal = $("#quick-view-modal");
  const modalImg = $("#modal-img");
  const modalName = $("#modal-name");
  const modalRating = $("#modal-rating");
  const modalPrice = $("#modal-price");
  const modalAddBtn = $("#modal-add-to-cart");

  if (!productGrid) {
    console.error("renderProducts.js: .product-grid not found in DOM");
    return;
  }

  // --- State ---
  let currentCategory = "all";
  let currentSort = "";
  let perPage = 6;
  let currentPage = 1;

  // Nguồn dữ liệu
  const source = Array.isArray(window.products) ? window.products : [];
  // NEW: chỉ lấy sản phẩm không ẩn
  let filtered = source.filter((p) => !p.hidden);
  let cart = JSON.parse(localStorage.getItem("cart_shoestore") || "[]");

  function getCart() {
    const cartData = localStorage.getItem("cart_shoestore");
    return cartData ? JSON.parse(cartData) : [];
  }

  function saveCart(cart) {
    localStorage.setItem("cart_shoestore", JSON.stringify(cart));
  }

  // --- Create product card ---
  function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;

    const badgeText =
      typeof product.getBadgeText === "function"
        ? product.getBadgeText()
        : product.badge === "sale"
        ? product.oldPrice && product.price && product.oldPrice > product.price
          ? `-${Math.round(
              ((product.oldPrice - product.price) / product.oldPrice) * 100
            )}%`
          : "Sale"
        : product.badge === "hot"
        ? "Hot"
        : product.badge === "new"
        ? "Mới"
        : product.badge || "";

    const badgeHtml = product.badge
      ? `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(
          badgeText
        )}</div>`
      : "";

    const imgHtml = product.img
      ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(
          product.name
        )}" class="product-img">`
      : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

    const priceHtml = product.oldPrice
      ? `<span class="current-price">${
          typeof product.getFormattedPrice === "function"
            ? product.getFormattedPrice()
            : new Intl.NumberFormat("vi-VN").format(product.price) + "₫"
        }</span> <span class="old-price">${
          typeof product.getFormattedOldPrice === "function"
            ? product.getFormattedOldPrice()
            : new Intl.NumberFormat("vi-VN").format(product.oldPrice) + "₫"
        }</span>`
      : `<span class="current-price">${
          typeof product.getFormattedPrice === "function"
            ? product.getFormattedPrice()
            : new Intl.NumberFormat("vi-VN").format(product.price) + "₫"
        }</span>`;

    const ratingHtml = `<div class="product-rating"><div class="stars">${
      typeof product.renderStars === "function" ? product.renderStars() : ""
    }</div><span class="rating-text">(${
      product.ratingCount || 0
    })</span></div>`;

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-image">
        ${imgHtml}
        <div class="product-overlay">
          <button type="button" class="quick-view" data-id="${
            product.id
          }">Xem nhanh</button>
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
    productGrid.innerHTML = "";
    const end = perPage * currentPage;
    const slice = filtered.slice(0, end);

    if (slice.length === 0) {
      productGrid.innerHTML =
        '<p class="no-products">Không có sản phẩm phù hợp.</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    slice.forEach((p) => frag.appendChild(createProductCard(p)));
    productGrid.appendChild(frag);

    if (loadMoreBtn) {
      if (filtered.length > end) loadMoreBtn.style.display = "block";
      else loadMoreBtn.style.display = "none";
    }
  }

  function applyFilters() {
    if (!Array.isArray(source)) {
      filtered = [];
    } else if (currentCategory === "all") {
      filtered = source.filter((p) => !p.hidden);
    } else {
      filtered = source.filter(
        (p) => !p.hidden && p.category === currentCategory
      );
    }

    if (currentSort === "price-asc") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === "newest") {
      filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (currentSort === "best-seller") {
      filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }

    currentPage = 1;
    renderList();
  }

  // --- Cart helpers ---
  function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, item) => s + (item.qty || 1), 0);
    if (cartCountEl) cartCountEl.textContent = count;
  }

  function addToCart(productId, qty = 1) {
    const id = Number(productId);
    const product = source.find((x) => x.id === id);
    if (!product) return;

    let cart = getCart();

    let imgPath = product.img || "";
    if (imgPath.includes("../img/")) {
      imgPath = imgPath.replace("../img/", "./img/");
    }

    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty = (existing.qty || 1) + qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty,
        img: imgPath,
      });
    }

    saveCart(cart);
    updateCartCount();
  }

  // --- Quick view (modal) ---
  function openQuickView(productId) {
    const id = Number(productId);
    const product = source.find((x) => x.id === id);
    if (!product || !modal) return;

    if (modalImg) {
      modalImg.src = product.img || "./img/NAME.avif";
      modalImg.alt = product.name;
    }
    if (modalName) {
      modalName.textContent = product.name;
    }
    if (modalRating) {
      modalRating.innerHTML = `${
        typeof product.renderStars === "function" ? product.renderStars() : ""
      } <span class="rating-text">(${product.ratingCount || 0})</span>`;
    }
    if (modalPrice) {
      const oldPriceHtml = product.oldPrice
        ? `<span class="old-price">${
            typeof product.getFormattedOldPrice === "function"
              ? product.getFormattedOldPrice()
              : new Intl.NumberFormat("vi-VN").format(product.oldPrice) + "₫"
          }</span>`
        : "";
      modalPrice.innerHTML = `<strong>${
        typeof product.getFormattedPrice === "function"
          ? product.getFormattedPrice()
          : new Intl.NumberFormat("vi-VN").format(product.price) + "₫"
      }</strong> ${oldPriceHtml}`;
    }

    if (modalAddBtn) modalAddBtn.dataset.id = id;

    modal.classList.add("open");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeQuickView() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  // --- Event listeners ---
  productGrid.addEventListener("click", (e) => {
    const qv = e.target.closest(".quick-view");
    if (qv) {
      const id = qv.dataset.id;
      openQuickView(id);
      return;
    }

    const add = e.target.closest(".add-to-cart");
    if (add) {
      const id = add.dataset.id;
      addToCart(id, 1);
      add.classList.add("added");
      setTimeout(() => add.classList.remove("added"), 600);
      return;
    }
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.filter || "all";
      applyFilters();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      currentSort = sortSelect.value || "";
      applyFilters();
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      currentPage++;
      renderList();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeQuickView();
    });
    modal.addEventListener("click", (e) => {
      if (e.target.closest(".close-btn")) closeQuickView();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeQuickView();
    });
  }

  if (modalAddBtn) {
    modalAddBtn.addEventListener("click", function () {
      const id = this.dataset.id;
      if (id) {
        addToCart(id, 1);
        closeQuickView();
      }
    });
  }

  // --- Init ---
  (function init() {
    updateCartCount();
    applyFilters(); // sẽ gọi renderList() bên trong
  })();
})();
