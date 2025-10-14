// Biến toàn cục
let nguoiDungHienTai = null;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    kiemTraDangNhap();
    hienThiThongTin();
    khoiTaoSuKien();
});

// Kiểm tra đăng nhập
function kiemTraDangNhap() {
    const duLieu = localStorage.getItem('nguoiDungHienTai');
    
    if (!duLieu) {
        alert('Vui lòng đăng nhập để xem hồ sơ');
        window.location.href = 'dangnhap.html';
        return;
    }
    
    try {
        nguoiDungHienTai = JSON.parse(duLieu);
        
        // ✅ THÊM: Kiểm tra nếu không có mật khẩu -> bắt đăng nhập lại
        if (!nguoiDungHienTai.matKhau) {
            alert('Phiên đăng nhập cũ không hợp lệ. Vui lòng đăng nhập lại!');
            localStorage.removeItem('nguoiDungHienTai');
            window.location.href = 'dangnhap.html';
            return;
        }
    } catch (e) {
        console.error('Lỗi đọc dữ liệu:', e);
        localStorage.removeItem('nguoiDungHienTai');
        window.location.href = 'dangnhap.html';
    }
}

// Hiển thị thông tin
function hienThiThongTin() {
    if (!nguoiDungHienTai) return;
    
    // Hiển thị thông tin cơ bản
    document.getElementById('hienThiHoTen').textContent = nguoiDungHienTai.hoTen || 'Chưa cập nhật';
    document.getElementById('hienThiTenDangNhap').textContent = nguoiDungHienTai.tenDangNhap || 'Chưa cập nhật';
    document.getElementById('hienThiEmail').textContent = nguoiDungHienTai.email || 'Chưa cập nhật';
    
    // Hiển thị thời gian đăng nhập
    if (nguoiDungHienTai.thoiGianDangNhap) {
        const thoiGian = new Date(nguoiDungHienTai.thoiGianDangNhap);
        const thoiGianFormat = formatThoiGian(thoiGian);
        document.getElementById('hienThiThoiGian').textContent = thoiGianFormat;
    } else {
        document.getElementById('hienThiThoiGian').textContent = 'Không có thông tin';
    }
}

// Format thời gian
function formatThoiGian(date) {
    const ngay = date.getDate().toString().padStart(2, '0');
    const thang = (date.getMonth() + 1).toString().padStart(2, '0');
    const nam = date.getFullYear();
    const gio = date.getHours().toString().padStart(2, '0');
    const phut = date.getMinutes().toString().padStart(2, '0');
    
    return `${ngay}/${thang}/${nam} lúc ${gio}:${phut}`;
}

// Khởi tạo sự kiện
function khoiTaoSuKien() {
    // Sự kiện sửa họ tên
    const nutSuaHoTen = document.getElementById('nutSuaHoTen');
    nutSuaHoTen.addEventListener('click', function() {
        suaThongTin('hoTen');
    });
    
    // Sự kiện sửa email
    const nutSuaEmail = document.getElementById('nutSuaEmail');
    nutSuaEmail.addEventListener('click', function() {
        suaThongTin('email');
    });
    
    // Sự kiện đổi mật khẩu
    document.getElementById('nutDoiMatKhau').addEventListener('click', hienFormDoiMatKhau);
    document.getElementById('nutLuuMatKhau').addEventListener('click', luuMatKhau);
    document.getElementById('nutHuyMatKhau').addEventListener('click', anFormDoiMatKhau);
    
    // Sự kiện show/hide password
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
    
    // Sự kiện đăng xuất
    document.getElementById('nutDangXuat').addEventListener('click', dangXuat);
}

// Sửa thông tin (họ tên hoặc email)
function suaThongTin(loai) {
    const spanId = loai === 'hoTen' ? 'hienThiHoTen' : 'hienThiEmail';
    const inputId = loai === 'hoTen' ? 'inputHoTen' : 'inputEmail';
    const nutId = loai === 'hoTen' ? 'nutSuaHoTen' : 'nutSuaEmail';
    const loiId = loai === 'hoTen' ? 'loiHoTen' : 'loiEmail';
    
    const span = document.getElementById(spanId);
    const input = document.getElementById(inputId);
    const nut = document.getElementById(nutId);
    
    // Nếu đang ở chế độ sửa -> Lưu
    if (input.style.display !== 'none') {
        const giaTriMoi = input.value.trim();
        
        // Validation
        if (loai === 'hoTen') {
            if (!giaTriMoi || giaTriMoi.length < 2) {
                hienLoi(loiId, 'Họ tên phải có ít nhất 2 ký tự');
                return;
            }
        } else if (loai === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
            if (!giaTriMoi || !emailPattern.test(giaTriMoi)) {
                hienLoi(loiId, 'Email không đúng định dạng');
                return;
            }
        }
        
        // Cập nhật thông tin
        nguoiDungHienTai[loai] = giaTriMoi;
        localStorage.setItem('nguoiDungHienTai', JSON.stringify(nguoiDungHienTai));
        
        // Hiển thị lại span
        span.textContent = giaTriMoi;
        span.style.display = 'block';
        input.style.display = 'none';
        
        // Đổi nút về "Sửa"
        nut.innerHTML = '<i class="fas fa-edit"></i> Sửa';
        nut.classList.remove('dang-sua');
        
        // Xóa lỗi
        xoaLoi(loiId);
        
        // Thông báo thành công
        alert(`Cập nhật ${loai === 'hoTen' ? 'họ tên' : 'email'} thành công!`);
    } 
    // Nếu đang ở chế độ xem -> Chuyển sang sửa
    else {
        input.value = span.textContent;
        span.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        
        // Đổi nút thành "Lưu"
        nut.innerHTML = '<i class="fas fa-save"></i> Lưu';
        nut.classList.add('dang-sua');
        
        // Xóa lỗi cũ
        xoaLoi(loiId);
    }
}

// Hiện form đổi mật khẩu
function hienFormDoiMatKhau() {
    const form = document.getElementById('formDoiMatKhau');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
    
    // Reset form
    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

// Ẩn form đổi mật khẩu
function anFormDoiMatKhau() {
    document.getElementById('formDoiMatKhau').style.display = 'none';
    document.getElementById('matKhauCu').value = '';
    document.getElementById('matKhauMoi').value = '';
    document.getElementById('xacNhanMatKhauMoi').value = '';
    xoaTatCaLoiMatKhau();
}

// Lưu mật khẩu mới
function luuMatKhau() {
    const matKhauCu = document.getElementById('matKhauCu').value;
    const matKhauMoi = document.getElementById('matKhauMoi').value;
    const xacNhan = document.getElementById('xacNhanMatKhauMoi').value;
    
    let hopLe = true;
    
    // Xóa lỗi cũ
    xoaTatCaLoiMatKhau();
    
    // Kiểm tra mật khẩu cũ
    if (!matKhauCu) {
        hienLoi('loiMatKhauCu', 'Vui lòng nhập mật khẩu hiện tại');
        hopLe = false;
    } else if (matKhauCu !== nguoiDungHienTai.matKhau) {
        hienLoi('loiMatKhauCu', 'Mật khẩu hiện tại không đúng');
        hopLe = false;
    }
    
    // Kiểm tra mật khẩu mới
    if (!matKhauMoi) {
        hienLoi('loiMatKhauMoi', 'Vui lòng nhập mật khẩu mới');
        hopLe = false;
    } else if (matKhauMoi.length < 6) {
        hienLoi('loiMatKhauMoi', 'Mật khẩu phải có ít nhất 6 ký tự');
        hopLe = false;
    } else if (matKhauMoi === matKhauCu) {
        hienLoi('loiMatKhauMoi', 'Mật khẩu mới phải khác mật khẩu cũ');
        hopLe = false;
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (!xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Vui lòng xác nhận mật khẩu mới');
        hopLe = false;
    } else if (matKhauMoi !== xacNhan) {
        hienLoi('loiXacNhanMatKhauMoi', 'Mật khẩu xác nhận không khớp');
        hopLe = false;
    }
    
    if (hopLe) {
        // Cập nhật mật khẩu
        nguoiDungHienTai.matKhau = matKhauMoi;
        localStorage.setItem('nguoiDungHienTai', JSON.stringify(nguoiDungHienTai));
        
        alert('Đổi mật khẩu thành công!');
        anFormDoiMatKhau();
    }
}

// Đăng xuất
function dangXuat() {
    const xacNhan = confirm('Bạn có chắc chắn muốn đăng xuất?');
    
    if (xacNhan) {
        localStorage.removeItem('nguoiDungHienTai');
        alert('Đã đăng xuất thành công!');
        window.location.href = 'dangnhap.html';
    }
}

// Utility functions
function hienLoi(id, msg) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.classList.add('hien');
    }
}

function xoaLoi(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hien');
    }
}

function xoaTatCaLoiMatKhau() {
    xoaLoi('loiMatKhauCu');
    xoaLoi('loiMatKhauMoi');
    xoaLoi('loiXacNhanMatKhauMoi');
}