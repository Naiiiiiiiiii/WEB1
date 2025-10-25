// admin-main.js
document.addEventListener('DOMContentLoaded', function() {
    // Xử lý navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class từ tất cả
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Add active class cho link được click
            this.classList.add('active');
            
            // Hiển thị section tương ứng
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Khởi tạo dữ liệu dashboard
    initDashboard();
});

function initDashboard() {
    // Giả lập dữ liệu - thay bằng API thực tế
    document.getElementById('countAccount').textContent = '125 tài khoản';
    document.getElementById('countProducts').textContent = '89 sản phẩm';
    document.getElementById('countOrders').textContent = '342 đơn hàng';
}