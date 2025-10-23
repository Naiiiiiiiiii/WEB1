// quickview.js - LOGIC XEM NHANH SẢN PHẨM TRONG MODAL

// Lấy các phần tử modal cần thiết
const modal = document.getElementById('quick-view-modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalRating = document.getElementById('modal-rating');
const modalPrice = document.getElementById('modal-price');
const closeBtn = document.querySelector('.close-btn');
const viewDetailBtn = document.getElementById('modal-view-detail');
const modalAddToCartBtn = document.getElementById('modal-add-to-cart'); // Lấy nút Thêm vào giỏ hàng trong modal

// Hàm xử lý sự kiện click Xem nhanh
function handleQuickViewClick() {
    // 'this' ở đây là nút .quick-view được click
    const card = this.closest('.product-card');

    // Lấy dữ liệu từ card (đảm bảo rằng product-card có data-id)
    const id = card.dataset.id;
    const imgSrc = card.querySelector('.product-img')?.src || './img/NAME.avif';
    const name = card.querySelector('.product-name')?.textContent || 'Tên sản phẩm';
    const ratingText = card.querySelector('.rating-text')?.textContent || '(0)';
    const price = card.querySelector('.current-price')?.textContent || '0₫';
    const oldPrice = card.querySelector('.old-price')?.textContent || '';
    
    // Gán dữ liệu vào modal
    modalImg.src = imgSrc;
    modalName.textContent = name;
    modalRating.textContent = `Đánh giá: ${ratingText}`;
    modalPrice.innerHTML = `${price} ${oldPrice ? '<span class="old-price">' + oldPrice + '</span>' : ''}`;

    // Gán link xem chi tiết và data-id cho nút Add to Cart
    if (id) {
        viewDetailBtn.href = `product-detail.html?id=${id}`;
        modalAddToCartBtn.dataset.id = id; // Gán ID cho nút Thêm vào giỏ trong modal
    } else {
        viewDetailBtn.href = "#";
        modalAddToCartBtn.dataset.id = '';
    }

    // Hiển thị modal
    modal.style.display = 'flex';
}

// Hàm gắn sự kiện Quick View (ĐƯỢC EXPORT RA WINDOW)
// Hàm này sẽ được gọi lại bởi renderProducts.js và search-overlay.js mỗi khi sản phẩm được render/tìm kiếm.
window.attachQuickViewEvents = function() {
    // Lấy tất cả nút 'Xem nhanh' (quick-view)
    const quickViewButtons = document.querySelectorAll('.quick-view');
    
    // Xóa sự kiện cũ trước khi gắn lại để tránh trùng lặp
    quickViewButtons.forEach(button => {
        button.removeEventListener('click', handleQuickViewClick);
        button.addEventListener('click', handleQuickViewClick);
    });
}

// Xử lý đóng modal và gắn sự kiện lần đầu
document.addEventListener('DOMContentLoaded', function () {
    // Gắn sự kiện lần đầu cho các sản phẩm đã có sẵn trên trang
    window.attachQuickViewEvents();

    // Đóng modal bằng nút X
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Đóng modal bằng phím ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
    
    // Nếu bạn có hàm addToCart toàn cục, hãy gắn sự kiện cho nút trong modal
    if (modalAddToCartBtn && typeof window.addToCart === 'function') {
        modalAddToCartBtn.addEventListener('click', function() {
            const id = this.dataset.id;
            if (id) {
                window.addToCart(id, 1);
            }
        });
    }

    // Lắng nghe sự kiện custom (nếu có) để gắn lại quick-view sau khi render sản phẩm
    // document.addEventListener('productsRendered', window.attachQuickViewEvents);
});