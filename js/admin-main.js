import { UserManager } from './user.js';

/*
document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    const tableBody = document.querySelector('#user-table tbody');

    function saveUsersWithFlags() {
        const payload = userManager.users.map(u => ({
            hoTen: u.hoTen,
            tenDangNhap: u.tenDangNhap,
            email: u.email,
            matKhau: u.matKhau,
            isLocked: !!u.isLocked
        }));
        localStorage.setItem(userManager.STORAGE_KEY, JSON.stringify(payload));
    }

    function renderUsers() {
        const users = userManager.users || [];
        tableBody.innerHTML = '';

        users.forEach(u => {
            if (typeof u.isLocked === 'undefined') u.isLocked = false;

            const tr = document.createElement('tr');
            const statusText = u.isLocked ? 'Đã khóa' : 'Hoạt động';
            const lockBtnText = u.isLocked ? 'Mở khóa' : 'Khóa';
            tr.innerHTML = `
                <td>${escapeHtml(u.hoTen)}</td>
                <td>${escapeHtml(u.tenDangNhap)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td>${escapeHtml(u.matKhau)}</td>
                <td>${statusText}</td>
                <td>
                    <button class="btn-reset" data-username="${encodeURIComponent(u.tenDangNhap)}" style="margin-right:6px;">Reset mật khẩu</button>
                    <button class="btn-lock" data-username="${encodeURIComponent(u.tenDangNhap)}">${lockBtnText}</button>
                </td>
            `;
            if (u.isLocked) tr.style.opacity = '0.6';
            tableBody.appendChild(tr);
        });
    }

    tableBody.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) return;

        const username = decodeURIComponent(btn.getAttribute('data-username') || '');
        if (!username) return;

        if (btn.classList.contains('btn-reset')) {
            if (!confirm(`Reset mật khẩu của "${username}" về "123456"?`)) return;
            const user = userManager.users.find(u => u.tenDangNhap === username);
            if (!user) { alert('Không tìm thấy người dùng'); return; }
            user.matKhau = '123456';
            saveUsersWithFlags();
            alert('Đã reset mật khẩu.');
            renderUsers();
        } else if (btn.classList.contains('btn-lock')) {
            const user = userManager.users.find(u => u.tenDangNhap === username);
            if (!user) { alert('Không tìm thấy người dùng'); return; }
            user.isLocked = !user.isLocked;
            saveUsersWithFlags();
            alert(user.isLocked ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
            renderUsers();
        }
    });
    renderUsers();
});
*/

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.main-content section');

    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        menuItems.forEach(item => {
            if (item.getAttribute('href') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('href');
            showSection(sectionId);
        });
    });

    const defaultSection = window.location.hash || '#main';
    showSection(defaultSection);

    const logout = document.querySelector('a.logout');
    if (logout) {
        logout.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('bạn có muốn đăng xuất?')) {
                window.location.href = 'admin-login.html';
            }
        });
    }
});

