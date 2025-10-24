import { UserManager } from './user.js';

document.addEventListener('DOMContentLoaded', () => {

    const userManager = new UserManager();

    function updateSoLuongTaiKhoan() {
        const accountCount = document.getElementById('countAccount');
        if (accountCount) {
            accountCount.textContent = `Số tài khoản hiện có: ${userManager.users.length}`;
        }
    }

    function hienThiDanhSachUser() {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        userManager.users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.hoTen}</td>
                <td>${user.tenDangNhap}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn-reset" data-index="${index}">Reset MK</button>
                    <button class="btn-delete" data-index="${index}">Xóa</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        ganSuKienNut();
    }

    function ganSuKienNut() {
        const resetBtns = document.querySelectorAll('.btn-reset');
        const deleteBtns = document.querySelectorAll('.btn-delete');

        resetBtns.forEach(btn => btn.addEventListener('click', () => {
            resetMatKhau(btn.getAttribute('data-index'));
        }));

        deleteBtns.forEach(btn => btn.addEventListener('click', () => {
            xoaTaiKhoan(btn.getAttribute('data-index'));
        }));
    }

    function resetMatKhau(index) {
        if (!confirm("Bạn có muốn reset mật khẩu?")) return;

        userManager.users[index].matKhau = "123456";
        userManager.luuDanhSachUser();
        alert("Mật khẩu đã được reset thành 123456");
    }

    function xoaTaiKhoan(index) {
        if (!confirm("Bạn có muốn xóa người dùng này?")) return;

        userManager.users.splice(index, 1);
        userManager.luuDanhSachUser();
        hienThiDanhSachUser();
        updateSoLuongTaiKhoan();
        alert("Xóa tài khoản thành công!");
    }

    updateSoLuongTaiKhoan();
    hienThiDanhSachUser();
});
