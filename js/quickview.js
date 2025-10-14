document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('quick-view-modal');
  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const modalRating = document.getElementById('modal-rating');
  const modalPrice = document.getElementById('modal-price');
  const closeBtn = document.querySelector('.close-btn');
  const viewDetailBtn = document.getElementById('modal-view-detail');

  function attachQuickViewEvents() {
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
      button.addEventListener('click', function () {
        const card = this.closest('.product-card');

        // Lấy dữ liệu từ card
        const id = card.dataset.id; // nhớ thêm data-id vào product-card
        const imgSrc = card.querySelector('.product-img')?.src || './img/NAME.avif';
        const name = card.querySelector('.product-name')?.textContent || 'Tên sản phẩm';
        const rating = card.querySelector('.rating-text')?.textContent || '(0)';
        const price = card.querySelector('.current-price')?.textContent || '0₫';
        const oldPrice = card.querySelector('.old-price')?.textContent || '';

        // Gán dữ liệu vào modal
        modalImg.src = imgSrc;
        modalName.textContent = name;
        modalRating.textContent = `Đánh giá: ${rating}`;
        modalPrice.textContent = `${price} ${oldPrice ? '(Giá gốc: ' + oldPrice + ')' : ''}`;

        // Gán link xem chi tiết
        if (id) {
          viewDetailBtn.href = `product-detail.html?id=${id}`; // chuyển đến trang chi tiết sản phẩm
        } else {
          viewDetailBtn.href = "#";
        }

        // Hiển thị modal
        modal.style.display = 'flex';
      });
    });
  }

  // Lần đầu khi DOM sẵn sàng
  attachQuickViewEvents();

  // Mỗi lần sản phẩm render lại (từ search.js), gắn lại quick-view
  document.addEventListener('productsRendered', attachQuickViewEvents);

  // Đóng modal
  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  window.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
});