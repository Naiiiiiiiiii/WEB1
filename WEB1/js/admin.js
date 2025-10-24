document.addEventListener('DOMContentLoaded', () => {

    const trangDangNhap = document.getElementById('loginPage');
    const trangQuanTri = document.getElementById('adminPanel');
    const formDangNhap = document.getElementById('formDangNhap');
    const menuLinks = document.querySelectorAll('.nav-menu a');
    const cacSection = document.querySelectorAll('.main-content section');
    const nutDangXuat = document.querySelector('.logout');

    function hienTrangDangNhap() {
        trangDangNhap.style.display = 'flex';
        trangQuanTri.style.display = 'none';
        window.location.hash = ""; 
    }

    function hienTrangQuanTri() {
        trangDangNhap.style.display = 'none';
        trangQuanTri.style.display = 'block';
        chuyenSection('#index');
    }

    function kiemTraDangNhap() {
        const daDangNhap = localStorage.getItem('isLoggedIn');
        if (daDangNhap === 'true') {
            hienTrangQuanTri();
        } else {
            hienTrangDangNhap();
        }
    }

    function chuyenSection(id) {
        cacSection.forEach(sec => sec.classList.remove('active'));
        const secChon = document.querySelector(id);
        if (secChon) secChon.classList.add('active');

        menuLinks.forEach(link =>
            link.classList.toggle('active', link.getAttribute('href') === id)
        );
    }

    if (formDangNhap) {
        formDangNhap.addEventListener('submit', (e) => {
            e.preventDefault();

            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            if (user === 'admin' && pass === 'Admin123') {
                localStorage.setItem('isLoggedIn', 'true');
                alert('Đăng nhập thành công');
                hienTrangQuanTri();
            } else {
                alert('Sai tài khoản hoặc mật khẩu!');
            }
        });
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            chuyenSection(link.getAttribute('href'));
        });
    });

    if (nutDangXuat) {
        nutDangXuat.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có muốn đăng xuất?')) {
                localStorage.removeItem('isLoggedIn');
                alert('Đăng xuất thành công');
                hienTrangDangNhap();
            }
        });
    }

    kiemTraDangNhap();

});
