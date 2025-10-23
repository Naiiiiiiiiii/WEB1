document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formDangNhap');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            if (usernameInput.value === 'admin' && passwordInput.value === 'Admin123') {
                alert('Đăng nhập thành công!');
                window.location.href = './admin-index.html';
            } else {
                alert('Sai tên đăng nhập hoặc mật khẩu!');
            }
        });
    }
});

