
(function () {
  const cartContainer = document.getElementById("cart-container");

  if (!cartContainer) return;

  function formatPrice(v) {
    return new Intl.NumberFormat('vi-VN').format(v) + '₫';
  }

  // ✅ LẤY DỮ LIỆU TỪ LOCALSTORAGE THAY VÌ RESET
  function loadAndRenderCart() {
    let cart = JSON.parse(localStorage.getItem("cart_shoestore") || "[]");
    console.log('📦 [cart-display] Lấy giỏ hàng:', cart);

    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
      return;
    }

    // Render từng sản phẩm
    const itemsHtml = cart.map(item => `
      <div class="cart-item">
        <img src="${item.img || item.image || './img/placeholder.jpg'}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">  
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn minus" data-id="${item.id}">-</button>
            <input type="text" value="${item.qty}" class="qty-input" readonly>
            <button class="qty-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-total">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join("");

    cartContainer.innerHTML = `
      <div class="cart-list">
        ${itemsHtml}
      </div>
      <div class="cart-summary">
        <div class="cart-total-label">Tổng cộng:</div>
        <div class="cart-total-value">
          ${formatPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}
        </div>
      </div>
    `;

    // Gắn sự kiện tăng/giảm số lượng
    setupCartEvents();
  }

  function setupCartEvents() {
    // Nút tăng
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        updateQty(id, 1);
      });
    });

    // Nút giảm
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        updateQty(id, -1);
      });
    });
  }

  function updateQty(productId, delta) {
    let cart = JSON.parse(localStorage.getItem("cart_shoestore") || "[]");
    const item = cart.find(i => i.id === productId);

    if (item) {
      item.qty += delta;
      
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }

      localStorage.setItem("cart_shoestore", JSON.stringify(cart));
      loadAndRenderCart(); // Render lại
    }
  }

  // Chỉ load khi modal mở
  const cartLink = document.querySelector('a[href="#cart"]');
  if (cartLink) {
    cartLink.addEventListener('click', function() {
      setTimeout(() => loadAndRenderCart(), 100);
    });
  }

})();

