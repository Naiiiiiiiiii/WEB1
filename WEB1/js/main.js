// Kiểm tra trạng thái đăng nhập khi trang load
document.addEventListener('DOMContentLoaded', function() {
    kiemTraTrangThaiDangNhap();
    khoiTaoSuKienGioHang();
});

// Kiểm tra và hiển thị thông tin người dùng đã đăng nhập
function kiemTraTrangThaiDangNhap() {
    const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
    
    if (nguoiDungHienTai) {
        const thongTinUser = JSON.parse(nguoiDungHienTai);
        hienThiThongTinNguoiDung(thongTinUser);
    }
}

// Hiển thị thông tin người dùng trong header với nút đăng xuất đơn giản
function hienThiThongTinNguoiDung(thongTin) {
    const iconUser = document.querySelector('.nav-icons a[href="./dangnhap.html"]');
    
    if (iconUser) {
        // Tạo thông tin user với nút đăng xuất đơn giản
        const userSection = document.createElement('div');
        userSection.className = 'user-section';
        userSection.innerHTML = `
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <a href="./profile.html" class= "user-name">${thongTin.hoTen}</a>
            </div>
            <button class="logout-btn" onclick="dangXuat()" title="Đăng xuất">
                <i class="fas fa-sign-out-alt"></i>
                Đăng xuất
            </button>
        `;
        
        // Thay thế icon user bằng user section
        iconUser.parentNode.replaceChild(userSection, iconUser);
        
        console.log(`✅ Đã đăng nhập: ${thongTin.hoTen}`);
    }
}

// Hàm đăng xuất đơn giản
function dangXuat() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        // Xóa thông tin đăng nhập
        localStorage.removeItem('nguoiDungHienTai');
        
        // Xóa giỏ hàng nếu có
        localStorage.removeItem('gioHang');
        
        // Reset cart count về 0
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = '0';
        }
        
        // Thông báo và reload trang
        alert('Đăng xuất thành công!');
        window.location.reload();
    }
}

// Khởi tạo chức năng giỏ hàng cơ bản
function khoiTaoSuKienGioHang() {
    
    // Sự kiện click vào các icon khác
    const wishlistLink = document.querySelector('a[href="#wishlist"]');
    if (wishlistLink) {
        wishlistLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
            
            if (!nguoiDungHienTai) {
                alert('Vui lòng đăng nhập để xem danh sách yêu thích!');
                window.openLoginModal();
                return;
            }
            
            alert('Tính năng danh sách yêu thích đang được phát triển!');
        });
    }
    
    const cartLink = document.querySelector('a[href="#cart"]');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
                
            const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
            
            if (!nguoiDungHienTai) {
                alert('Vui lòng đăng nhập để xem giỏ hàng!');
                window.openLoginModal();
                return;
            }
            
            const cartModal = document.getElementById('cartModal');
            
            // Load và hiển thị giỏ hàng
            loadCartItems();
            cartModal.style.display = 'block';

            // Đóng modal
            const closeModal = document.querySelector('.cart-modal .close');
            if (closeModal) {
                closeModal.onclick = () => cartModal.style.display = 'none';
            }

            window.onclick = function(event) {
                if (event.target == cartModal) {
                    cartModal.style.display = 'none';
                }
            };
        });
    }
}

// ========== HÀM THÊM VÀO GIỎ HÀNG - SỬA LỖI ==========
function themVaoGioHang(product) {
    console.log('➕ Đang thêm sản phẩm:', product.name);
    
    // Lấy giỏ hàng hiện tại
    let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
    
    // Chuẩn hóa đường dẫn ảnh
    let imgPath = product.img || product.image || '';
    if (imgPath.includes('../img/')) {
        imgPath = imgPath.replace('../img/', './img/');
    }
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex !== -1) {
        // Nếu đã có, tăng số lượng
        cart[existingIndex].qty += 1;
        console.log('📈 Tăng số lượng sản phẩm:', cart[existingIndex]);
    } else {
        // Nếu chưa có, thêm mới
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            img: imgPath
        });
        console.log('🆕 Thêm sản phẩm mới vào giỏ');
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem('cart_shoestore', JSON.stringify(cart));
    console.log('💾 Đã lưu giỏ hàng:', cart);
    
    // Cập nhật số lượng hiển thị
    capNhatSoLuongGioHang();
}

// ========== CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG ==========
function capNhatSoLuongGioHang() {
    const cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalQty;
    }
    
    console.log('🔔 Cập nhật số lượng giỏ hàng:', totalQty);
}

// ========== LOAD VÀ HIỂN THỊ GIỎ HÀNG ==========
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
    const container = document.getElementById('cart-items');

    if (!container) {
        console.error('❌ Không tìm thấy #cart-items');
        return;
    }


    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <img src="${item.img || './img/placeholder.jpg'}" alt="${item.name}" width="80">
            <div style="flex: 1;">
                <p style="font-weight: bold; margin-bottom: 5px;">${item.name}</p>
                <p style="color: #ee4d2d; font-weight: bold;">${formatPrice(item.price)}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.qty}</span>
                <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button onclick="removeItem(${index})" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Xóa</button>
        </div>
    `).join('');
    
    // Hiển thị tổng tiền
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const summaryDiv = document.querySelector('.cart-summary');
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <strong>Tổng cộng:</strong> 
            <span style="color: #ee4d2d; font-size: 1.2rem; font-weight: bold;">${formatPrice(total)}</span>
        `;
    }
}

// ========== TĂNG/GIẢM SỐ LƯỢNG ==========
function updateQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
    
    if (cart[index]) {
        cart[index].qty += delta;
        
        // Nếu số lượng <= 0 thì xóa sản phẩm
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
            console.log('🗑️ Đã xóa sản phẩm khỏi giỏ');
        } else {
            console.log('🔄 Cập nhật số lượng:', cart[index]);
        }
        
        // Lưu lại
        localStorage.setItem('cart_shoestore', JSON.stringify(cart));
        
        // Render lại
        loadCartItems();
        capNhatSoLuongGioHang();
    }
}

// ========== XÓA SẢN PHẨM ==========
function removeItem(index) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
        cart.splice(index, 1);
        localStorage.setItem('cart_shoestore', JSON.stringify(cart));
        
        console.log('🗑️ Đã xóa sản phẩm');
        
        loadCartItems();
        capNhatSoLuongGioHang();
    }
}

// ========== FORMAT GIÁ ==========
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

// ========== SỰ KIỆN ĐẶT HÀNG - SỬA LỖI XÓA DỮ LIỆU CŨ ==========
document.addEventListener('DOMContentLoaded', function() {
    const placeOrderBtn = document.getElementById('place-order');
    const useAccountAddressBtn = document.getElementById('use-account-address');
    
    // Dùng địa chỉ tài khoản
    if (useAccountAddressBtn) {
        useAccountAddressBtn.addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('nguoiDungHienTai') || '{}');
            const addressInput = document.getElementById('shipping-address');
            
            if (user.address) {
                addressInput.value = user.address;
                console.log('✅ Đã điền địa chỉ từ tài khoản');
            } else {
                alert('Không tìm thấy địa chỉ trong tài khoản.');
            }
        });
    }
    
     console.log('✅ main.js đã load - xử lý đặt hàng bởi order-system.js');
});

// Thêm CSS đơn giản cho user section và nút đăng xuất
const styleCSS = `
.user-section {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.user-info i {
    font-size: 1.5rem;
    color: #ff6b35;
}

.user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Giữ trên một dòng */
    text-decoration: none;
    color: white;  
}

.logout-btn {
    background: linear-gradient(45deg, #dc3545, #c82333);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

.logout-btn:hover {
    background: linear-gradient(45deg, #c82333, #bd2130);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.logout-btn:active {
    transform: translateY(0);
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}

/* Responsive */
@media (max-width: 768px) {
    .user-section {
        flex-direction: column;
        gap: 8px;
    }
    
    .user-name {
        max-width: 80px;
    }
    
    .logout-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .user-name {
        display: none;
    }
    
    .logout-btn span {
        display: none;
    }
    
    .logout-btn {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        padding: 0;
        justify-content: center;
    }
}
`;

// Thêm CSS vào head
if (!document.querySelector('#user-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'user-styles';
    styleElement.textContent = styleCSS;
    document.head.appendChild(styleElement);
}

document.addEventListener('DOMContentLoaded', () => {
            const wrapper = document.querySelector('.slides-wrapper');
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const dots = document.querySelectorAll('.dot');
            
            if (!wrapper || slides.length === 0) {
                console.error("Lỗi: Không tìm thấy '.slides-wrapper' hoặc '.slide'");
                return;
            }

            let currentSlide = 0;
            const totalSlides = slides.length;
            const slideInterval = 4000; // 4 giây
            let autoSlideTimer;

            function updateSlide(index) {
                currentSlide = index;
                const offset = currentSlide * -100;
                wrapper.style.transform = `translateX(${offset}%)`;
                
                // Cập nhật active dot
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentSlide);
                });
            }

            function nextSlide() {
                const nextIndex = (currentSlide + 1) % totalSlides;
                updateSlide(nextIndex);
            }

            function prevSlide() {
                const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlide(prevIndex);
            }

            function startAutoSlide() {
                autoSlideTimer = setInterval(nextSlide, slideInterval);
            }

            function stopAutoSlide() {
                clearInterval(autoSlideTimer);
            }

            // Sự kiện nút prev/next
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoSlide();
                startAutoSlide(); // Khởi động lại auto slide
            });

            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoSlide();
                startAutoSlide();
            });

            // Sự kiện dots
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const slideIndex = parseInt(dot.dataset.slide);
                    updateSlide(slideIndex);
                    stopAutoSlide();
                    startAutoSlide();
                });
            });

            // Dừng auto khi hover
            wrapper.addEventListener('mouseenter', stopAutoSlide);
            wrapper.addEventListener('mouseleave', startAutoSlide);

            // Bắt đầu auto slide
            startAutoSlide();
        });