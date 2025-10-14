// Import User classes
import { User, UserManager } from './user.js';

// Biến toàn cục
const formDangNhap = document.getElementById('formDangNhap');
const formDangKy = document.getElementById('formDangKy');

// Khởi tạo UserManager
const userManager = new UserManager();

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    khoiTaoSuKien();
    console.log('🔑 Tài khoản demo: admin / Admin123');
});

// Khởi tạo sự kiện
function khoiTaoSuKien() {
    // Tab switching
    document.querySelectorAll('.nut-tab').forEach(nut => {
        nut.addEventListener('click', function() {
            chuyenTab(this.getAttribute('data-tab'));
        });
    });

    // Show/hide password
    document.querySelectorAll('.hien-mat-khau').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = document.getElementById(this.getAttribute('data-target'));
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Remove error messages on input
    document.getElementById('emailDangKy').addEventListener('input', () => {
        xoaLoi('loiEmailDangKy');
    });

    document.getElementById('phone').addEventListener('input', () => {
        xoaLoi('loiPhoneDangKy');
    });

    // Form submit
    formDangNhap.addEventListener('submit', xuLyDangNhap);
    formDangKy.addEventListener('submit', xuLyDangKy);
}

// Chuyển tab
function chuyenTab(tab) {
    document.querySelectorAll('.nut-tab').forEach(nut => nut.classList.remove('active'));
    document.querySelectorAll('.noi-dung-tab').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
    
    // Reset form
    document.querySelectorAll('form').forEach(form => form.reset());
    document.querySelectorAll('.thong-bao-loi').forEach(msg => msg.classList.remove('hien'));
}

// Xử lý đăng nhập
function xuLyDangNhap(event) {
    event.preventDefault();
    
    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const matKhau = document.getElementById('matKhauDangNhap').value;
    
    // Kiểm tra rỗng
    if (!tenDangNhap) {
        hienLoi('loiTenDangNhap', 'Vui lòng nhập tên đăng nhập');
        return;
    }
    if (!matKhau) {
        hienLoi('loiMatKhauDangNhap', 'Vui lòng nhập mật khẩu');
        return;
    }
    
    // Hiện loading
    hienLoading('loadingDangNhap');
    
    setTimeout(() => {
        // Sử dụng UserManager để tìm tài khoản
        const taiKhoan = userManager.timTaiKhoan(tenDangNhap, matKhau);
        
        anLoading('loadingDangNhap');
        
        if (taiKhoan) {
            // Lưu thông tin đăng nhập (BAO GỒM MẬT KHẨU)
            const thongTinDangNhap = {
                hoTen: taiKhoan.hoTen,
                tenDangNhap: taiKhoan.tenDangNhap,
                email: taiKhoan.email,
                matKhau: taiKhoan.matKhau, // ✅ THÊM DÒNG NÀY
                thoiGianDangNhap: new Date().toISOString()
            };
            
            localStorage.setItem('nguoiDungHienTai', JSON.stringify(thongTinDangNhap));
            
            alert(`Chào mừng ${taiKhoan.hoTen}!`);
            window.location.href = 'index.html';
        } else {
            // Kiểm tra xem tài khoản có tồn tại không
            const coTaiKhoan = userManager.tonTaiTenDangNhap(tenDangNhap) || 
                               userManager.tonTaiEmail(tenDangNhap);
            
            if (coTaiKhoan) {
                hienLoi('loiMatKhauDangNhap', 'Mật khẩu không đúng');
            } else {
                hienLoi('loiTenDangNhap', 'Tài khoản không tồn tại');
            }
        }
    }, 800);
}

// Xử lý đăng ký
function xuLyDangKy(event) {
    event.preventDefault();
    
    const hoTen = document.getElementById('hoTen').value.trim();
    const tenDangKy = document.getElementById('tenDangKy').value.trim();
    const email = document.getElementById('emailDangKy').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
    const matKhau = document.getElementById('matKhauDangKy').value;
    const xacNhan = document.getElementById('xacNhanMatKhau').value;
    const phone = document.getElementById('phone').value.trim();
    const phonePattern = /^0\d{9}$/;

    let hopLe = true;
    
    // Kiểm tra cơ bản
    if (!hoTen || hoTen.length < 2) {
        hienLoi('loiHoTen', 'Họ tên phải có ít nhất 2 ký tự');
        hopLe = false;
    }
    
    if (!tenDangKy || tenDangKy.length < 3) {
        hienLoi('loiTenDangKy', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        hopLe = false;
    }
    
    if (!email || !emailPattern.test(email)) {
        hienLoi('loiEmailDangKy', 'Email không đúng định dạng');
        hopLe = false;
    }

    if (!phonePattern.test(phone)) {
        hienLoi('loiPhoneDangKy', 'Số điện thoại không đúng định dạng');
        hopLe = false;
    } 
    
    if (!matKhau || matKhau.length < 6) {
        hienLoi('loiMatKhauDangKy', 'Mật khẩu phải có ít nhất 6 ký tự');
        hopLe = false;
    }
    
    if (matKhau !== xacNhan) {
        hienLoi('loiXacNhanMatKhau', 'Mật khẩu xác nhận không khớp');
        hopLe = false;
    }
    
    // Kiểm tra trùng lặp sử dụng UserManager
    if (userManager.tonTaiTenDangNhap(tenDangKy)) {
        hienLoi('loiTenDangKy', 'Tên đăng nhập đã được sử dụng');
        hopLe = false;
    }
    
    if (userManager.tonTaiEmail(email)) {
        hienLoi('loiEmailDangKy', 'Email đã được sử dụng');
        hopLe = false;
    }
    
    if (hopLe) {
        hienLoading('loadingDangKy');
        
        setTimeout(() => {
            // Thêm tài khoản mới sử dụng UserManager
            userManager.themTaiKhoan(hoTen, tenDangKy, email, matKhau);
            
            anLoading('loadingDangKy');
            alert(`Đăng ký thành công! Chào mừng ${hoTen}`);
            
            // Chuyển tab và điền username
            chuyenTab('dang-nhap');
            document.getElementById('tenDangNhap').value = tenDangKy;
        }, 800);
    }
}

// Utility functions
function hienLoi(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('hien');
}

function xoaLoi(id) {
    document.getElementById(id).classList.remove('hien');
}

function hienLoading(id) {
    document.getElementById(id).classList.add('hien');
}

function anLoading(id) {
    document.getElementById(id).classList.remove('hien');
}