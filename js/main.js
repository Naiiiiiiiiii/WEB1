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
                <span class="user-name">${thongTin.hoTen}</span>
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
    // Lấy tất cả nút "Thêm vào giỏ"
    const cacNutThemVaoGio = document.querySelectorAll('.add-to-cart');
    const soLuongGioHang = document.querySelector('.cart-count');
    
    cacNutThemVaoGio.forEach(nut => {
        nut.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Kiểm tra đăng nhập trước khi thêm vào giỏ
            const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
            
            if (!nguoiDungHienTai) {
                alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
                window.location.href = './dangnhap.html';
                return;
            }
            
            // // Thêm hiệu ứng và cập nhật số lượng
            // this.style.background = '#28a745';
            // this.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
            
            // setTimeout(() => {
            //     this.style.background = '';
            //     this.innerHTML = '<i class="fas fa-cart-plus"></i> Thêm vào giỏ';
            // }, 1500);
            
            // Cập nhật số lượng giỏ hàng
            let soLuongHienTai = parseInt(soLuongGioHang.textContent) || 0;
            soLuongGioHang.textContent = soLuongHienTai + 1;
            
            // Hiệu ứng bounce cho icon giỏ hàng
            const iconGioHang = document.querySelector('a[href="#cart"]');
            iconGioHang.style.animation = 'bounce 0.3s ease';
            setTimeout(() => {
                iconGioHang.style.animation = '';
            }, 300);
        });
    });
    
    // Sự kiện click vào các icon khác
    document.querySelector('a[href="#wishlist"]').addEventListener('click', function(e) {
        e.preventDefault();
        
        const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
        
        if (!nguoiDungHienTai) {
            alert('Vui lòng đăng nhập để xem danh sách yêu thích!');
            window.location.href = './dangnhap.html';
            return;
        }
        
        alert('Tính năng danh sách yêu thích đang được phát triển!');
    });
    
    document.querySelector('a[href="#cart"]').addEventListener('click', function(e) {
        e.preventDefault();
        
        const nguoiDungHienTai = localStorage.getItem('nguoiDungHienTai');
        
        if (!nguoiDungHienTai) {
            alert('Vui lòng đăng nhập để xem giỏ hàng!');
            window.location.href = './dangnhap.html';
            return;
        }
        
        alert('Tính năng giỏ hàng đang được phát triển!');
    });
}

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
    white-space: nowrap;
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