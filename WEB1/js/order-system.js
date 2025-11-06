
/**
 * Format giá tiền theo định dạng Việt Nam
 * @param {number} price - Giá cần format
 * @returns {string} Giá đã format (VD: 1.000.000₫)
 */
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

/**
 * Format ngày giờ
 * @param {string} dateString - Chuỗi ngày giờ ISO
 * @returns {string} Ngày giờ đã format (VD: 26/10/2025 lúc 14:30)
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
}

/**
 * Lấy tên phương thức thanh toán
 * @param {string} value - Mã phương thức thanh toán
 * @returns {string} Tên đầy đủ
 */
function getPaymentMethodName(value) {
    const names = {
        'cod': 'Tiền mặt khi nhận hàng',
        'bank': 'Chuyển khoản ngân hàng',
        'online': 'Thanh toán trực tuyến'
    };
    return names[value] || value;
}

// ================================================================
// PHẦN 2: POPUP XEM LẠI ĐƠN HÀNG SAU KHI ĐẶT HÀNG
// ================================================================

/**
 * ✅ TÍNH NĂNG 1-4: Hiển thị popup xem lại đơn hàng
 * Được gọi ngay sau khi đặt hàng thành công
 * 
 * @param {Object} order - Đối tượng đơn hàng
 */
function showOrderSuccessModal(order) {
    console.log('📋 [TÍNH NĂNG 1] Hiển thị popup xem lại đơn hàng:', order);
    
    // ✅ TÍNH NĂNG 2: Hiển thị thông tin đơn hàng
    document.getElementById('reviewOrderId').textContent = order.id;
    document.getElementById('reviewOrderTime').textContent = formatDateTime(order.createdAt);
    document.getElementById('reviewOrderAddress').textContent = order.address || order.shippingAddress;
    
    const paymentName = getPaymentMethodName(order.payment);
    document.getElementById('reviewOrderPayment').textContent = paymentName;
    
    // ✅ TÍNH NĂNG 4: Hiển thị tổng tiền
    document.getElementById('reviewOrderTotal').textContent = formatPrice(order.total);
    
    // ✅ TÍNH NĂNG 3: Hiển thị danh sách sản phẩm
    const itemsContainer = document.getElementById('order-review-items');
    const itemsHtml = order.items.map(item => `
        <div class="cart-item">
            <img src="${item.img || './img/placeholder.jpg'}" alt="${item.name}">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${formatPrice(item.price)}</div>
                <div class="item-qty">Số lượng: <strong>${item.qty}</strong></div>
            </div>
            <div class="item-total">${formatPrice(item.price * item.qty)}</div>
        </div>
    `).join('');
    
    itemsContainer.innerHTML = itemsHtml;
    
    // Hiển thị modal
    document.getElementById('orderSuccessModal').style.display = 'block';
    
    // Ẩn modal giỏ hàng
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
    
    console.log('✅ [TÍNH NĂNG 1-4] Đã hiển thị popup xem lại đơn hàng');
}

/**
 * Đóng popup xem lại đơn hàng
 */
function closeOrderSuccessModal() {
    document.getElementById('orderSuccessModal').style.display = 'none';
    console.log('❌ Đã đóng popup xem lại đơn hàng');
}

/**
 * ✅ TÍNH NĂNG 6: Tiếp tục mua sắm
 */
function continueShopping() {
    console.log('🛒 [TÍNH NĂNG 6] Tiếp tục mua sắm');
    closeOrderSuccessModal();
    
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ================================================================
// PHẦN 3: LỊCH SỬ ĐƠN HÀNG
// ================================================================

/**
 * ✅ TÍNH NĂNG 5 & 7: Mở modal lịch sử đơn hàng
 */
function openOrderHistory() {
    console.log('📜 [TÍNH NĂNG 5] Mở lịch sử đơn hàng');
    
    // Kiểm tra đăng nhập
    const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
    if (!nguoiDungHienTai) {
        alert('Vui lòng đăng nhập để xem lịch sử đơn hàng!');
        window.openLoginModal();
        return;
    }

    closeOrderSuccessModal();
    
    const orders = JSON.parse(localStorage.getItem('order_history') || '[]');
    console.log('📦 Tổng số đơn hàng:', orders.length);
    
    renderOrderHistory(orders);
    calculateStats(orders);
    
    document.getElementById('orderHistoryModal').style.display = 'block';
    console.log('✅ [TÍNH NĂNG 5 & 7] Đã hiển thị lịch sử đơn hàng');
}

/**
 * Đóng modal lịch sử đơn hàng
 */
function closeOrderHistory() {
    document.getElementById('orderHistoryModal').style.display = 'none';
}

/**
 * ✅ TÍNH NĂNG 7: Tính toán thống kê
 */
function calculateStats(orders) {
    console.log('📊 [TÍNH NĂNG 7] Tính toán thống kê');
    
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const totalItems = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0);
    }, 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
    document.getElementById('totalItems').textContent = totalItems;
    
    console.log('✅ Thống kê:', { totalOrders, totalSpent: formatPrice(totalSpent), totalItems });
}

/**
 * ✅ TÍNH NĂNG 7: Render danh sách đơn hàng
 */
function renderOrderHistory(orders) {
    console.log('🎨 [TÍNH NĂNG 7] Render danh sách đơn hàng');
    
    const container = document.getElementById('orderHistoryList');

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Bạn chưa đặt hàng lần nào. Hãy khám phá các sản phẩm!</p>
            </div>
        `;
        return;
    }

    const sortedOrders = [...orders].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const orderHTML = sortedOrders.map(order => {
        const itemsHTML = order.items.map(item => `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <img src="${item.img || './img/placeholder.jpg'}" 
                     alt="${item.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${item.name}</div>
                    <div style="color: #666; font-size: 0.9rem;">
                        ${formatPrice(item.price)} x ${item.qty}
                    </div>
                </div>
                <div style="font-weight: bold; color: #333;">
                    ${formatPrice(item.price * item.qty)}
                </div>
            </div>
        `).join('');

        const paymentMethodName = getPaymentMethodName(order.payment);

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">
                            <i class="fas fa-hashtag"></i> ${order.id}
                        </div>
                        <div class="order-date">
                            <i class="far fa-clock"></i> ${formatDateTime(order.createdAt)}
                        </div>
                    </div>
                    <span class="order-status">
                        <i class="fas fa-check-circle"></i> Đã đặt hàng
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">
                            <i class="fas fa-map-marker-alt"></i> Địa chỉ giao hàng
                        </div>
                        <div style="font-weight: 600; color: #333;">
                            ${order.address || order.shippingAddress}
                        </div>
                    </div>
                    <div>
                        <div style="color: #666; font-size: 0.85rem; margin-bottom: 5px;">
                            <i class="fas fa-credit-card"></i> Thanh toán
                        </div>
                        <div style="font-weight: 600; color: #333;">${paymentMethodName}</div>
                    </div>
                </div>

                <div class="order-items-preview">
                    <h4 style="margin-bottom: 10px; color: #333; font-size: 0.95rem;">
                        <i class="fas fa-shopping-bag"></i> Sản phẩm (${order.items.length})
                    </h4>
                    ${itemsHTML}
                </div>

                <div class="order-total-row">
                    <span style="color: #333;">Tổng cộng:</span>
                    <span style="color: #ee4d2d;">${formatPrice(order.total)}</span>
                </div>

                <div style="margin-top: 1rem; display: flex; gap: 10px;">
                    <button onclick="reorderItems('${order.id}')" 
                            style="flex: 1; padding: 10px; background: #28a745; color: white; 
                                   border: none; border-radius: 6px; cursor: pointer; 
                                   font-weight: 600; display: flex; align-items: center; 
                                   justify-content: center; gap: 8px;">
                        <i class="fas fa-redo"></i> Đặt lại
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = orderHTML;
    console.log('✅ Đã render', sortedOrders.length, 'đơn hàng');
}

/**
 * Đặt lại đơn hàng
 */
function reorderItems(orderId) {
    console.log('🔄 Đặt lại đơn hàng:', orderId);
    
    const orders = JSON.parse(localStorage.getItem('order_history') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        if (confirm(`Đặt lại ${order.items.length} sản phẩm từ đơn hàng ${orderId}?`)) {
            let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
            
            order.items.forEach(item => {
                const existing = cart.find(i => i.id === item.id);
                if (existing) {
                    existing.qty += item.qty;
                } else {
                    cart.push({...item});
                }
            });
            
            localStorage.setItem('cart_shoestore', JSON.stringify(cart));
            
            const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = totalQty;
            }
            
            alert('✅ Đã thêm sản phẩm vào giỏ hàng!');
            closeOrderHistory();
        }
    }
}

// ================================================================
// PHẦN 4: XỬ LÝ ĐẶT HÀNG
// ================================================================

/**
 * Khởi tạo hệ thống đặt hàng
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 Khởi tạo hệ thống đơn hàng');
    
    const placeOrderBtn = document.getElementById("place-order");
    
    if (!placeOrderBtn) {
        console.warn('⚠️ Không tìm thấy nút đặt hàng');
        return;
    }

    /**
     * ✅ XỬ LÝ ĐẶT HÀNG - KẾT NỐI TẤT CẢ TÍNH NĂNG
     */
    placeOrderBtn.addEventListener("click", function() {
        console.log('🛒 Bắt đầu xử lý đặt hàng');
        
        const cart = JSON.parse(localStorage.getItem("cart_shoestore") || "[]");


        // Kiểm tra địa chỉ
        const addressInput = document.getElementById('shipping-address');
        if (!addressInput || !addressInput.value.trim()) {
            alert('⚠️ Vui lòng nhập địa chỉ giao hàng!');
            addressInput?.focus();
            return;
        }

        // Kiểm tra phương thức thanh toán
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            alert('⚠️ Vui lòng chọn phương thức thanh toán!');
            return;
        }

        // Tạo đơn hàng
        const order = {
            id: 'ORD' + Date.now(),
            items: cart,
            address: addressInput.value,
            payment: paymentMethod.value,
            total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
            createdAt: new Date().toISOString()
        };

        console.log('📦 Đã tạo đơn hàng:', order);

        // Lưu vào lịch sử
        const orderHistory = JSON.parse(localStorage.getItem('order_history') || '[]');
        orderHistory.push(order);
        localStorage.setItem('order_history', JSON.stringify(orderHistory));
        console.log('💾 Đã lưu vào lịch sử');

        // Xóa giỏ hàng
        localStorage.removeItem('cart_shoestore');
        console.log('🧹 Đã xóa giỏ hàng');

        // Reset form
        addressInput.value = '';
        
        // Cập nhật UI giỏ hàng
        const cartContainer = document.getElementById("cart-container");
        if (cartContainer) {
            cartContainer.innerHTML = "<p>Chưa có sản phẩm nào trong giỏ hàng.</p>";
        }
        
        // Cập nhật số lượng
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = '0';
        }

        // ✅ HIỂN THỊ POPUP XEM LẠI ĐƠN HÀNG
        showOrderSuccessModal(order);
    });
    
    // Đóng modal khi click bên ngoài
    window.addEventListener("click", function(e) {
        if (e.target === document.getElementById('orderSuccessModal')) {
            closeOrderSuccessModal();
        }
        if (e.target === document.getElementById('orderHistoryModal')) {
            closeOrderHistory();
        }
    });
    
    console.log('✅ Khởi tạo hệ thống đơn hàng hoàn tất');
});
