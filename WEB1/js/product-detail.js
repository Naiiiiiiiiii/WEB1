(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("product-detail");
    if (!container) return console.error("❌ Không tìm thấy #product-detail");

    // Lấy id sản phẩm từ URL
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"));
    if (!productId) {
      container.innerHTML = "<p>Không tìm thấy sản phẩm!</p>";
      return;
    }

    // Kiểm tra dữ liệu
    if (typeof products === "undefined" || !Array.isArray(products)) {
      container.innerHTML = "<p>Lỗi tải dữ liệu sản phẩm!</p>";
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      container.innerHTML = "<p>Sản phẩm không tồn tại!</p>";
      return;
    }

    renderProductDetail(product);
  });

  // === Render chi tiết sản phẩm ===
  function renderProductDetail(product) {
    const container = document.getElementById("product-detail");
    const imgSrc = product.img || product.image || "./img/placeholder.jpg";

    const thumbnails = (product.images || [imgSrc])
      .map(
        (img, i) => `
        <img src="${img}" alt="Thumbnail ${i + 1}" 
             class="thumbnail ${i === 0 ? "active" : ""}">
      `
      )
      .join("");

    container.innerHTML = `
      <div class="container">
        <div class="product-main">
          <!-- Ảnh -->
          <div class="product-images">
            <div class="main-image">
              <img src="${imgSrc}" alt="${product.name}" id="mainProductImage">
            </div>
            <div class="image-thumbnails">${thumbnails}</div>
          </div>

          <!-- Thông tin -->
          <div class="product-info-detail">
            <h1>${product.name}</h1>
            
            <div class="product-rating">
              <div class="stars">⭐️⭐️⭐️⭐️⭐️</div>
              <span class="rating-count">(0 đánh giá)</span>
            </div>

            <div class="product-price-section">
              <div>
                <span>${formatPrice(product.price)}</span>
              </div>
            </div>

            <div class="product-features">
              <div class="feature-item">
                <i class="fas fa-truck"></i>
                <div>
                  <strong>Miễn phí vận chuyển</strong>
                  <p>Cho đơn hàng trên 500.000đ</p>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-undo"></i>
                <div>
                  <strong>Đổi trả dễ dàng</strong>
                  <p>Trong vòng 7 ngày</p>
                </div>
              </div>
            </div>

            <div class="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>${product.description || "Chưa có mô tả chi tiết."}</p>
            </div>

            <div class="product-category">
              <span class="category-badge">${product.category || "Khác"}</span>
            </div>

            <div class="quantity-selector">
              <label>Số lượng:</label>
              <div class="quantity-controls">
                <button class="qty-btn" id="decreaseQty">-</button>
                <input type="number" id="qtyInput" value="1" min="1">
                <button class="qty-btn" id="increaseQty">+</button>
              </div>
            </div>

            <div class="product-actions">
              <button class="btn-add-to-cart" id="addToCartBtn">
                <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setupThumbnails();
    setupQuantityButtons();
    setupAddToCart(product);
  }

  // === Helper ===
  function formatPrice(price) {
    if (!price) return "0₫";
    return price.toLocaleString("vi-VN") + "₫";
  }

  // === Thumbnail click ===
  function setupThumbnails() {
    const mainImg = document.getElementById("mainProductImage");
    const thumbs = document.querySelectorAll(".thumbnail");
    thumbs.forEach((t) =>
      t.addEventListener("click", () => {
        mainImg.src = t.src;
        thumbs.forEach((x) => x.classList.remove("active"));
        t.classList.add("active");
      })
    );
  }

  // === Nút tăng/giảm số lượng ===
  function setupQuantityButtons() {
    const input = document.getElementById("qtyInput");
    const dec = document.getElementById("decreaseQty");
    const inc = document.getElementById("increaseQty");

    dec.addEventListener("click", () => {
      const val = Math.max(1, parseInt(input.value) - 1);
      input.value = val;
    });
    inc.addEventListener("click", () => {
      const val = Math.min(99, parseInt(input.value) + 1);
      input.value = val;
    });
  }

  // === Thêm vào giỏ hàng ===
  function setupAddToCart(product) {
    const btn = document.getElementById("addToCartBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const qty = parseInt(document.getElementById("qtyInput").value) || 1;
      let cart = JSON.parse(localStorage.getItem("cart_shoestore") || "[]");

      const exist = cart.find((i) => i.id === product.id);
      if (exist) exist.qty += qty;
      else
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          img: product.img || product.image,
          qty,
        });

      localStorage.setItem("cart_shoestore", JSON.stringify(cart));
      alert("🛒 Đã thêm vào giỏ hàng!");
    });
  }
})();
