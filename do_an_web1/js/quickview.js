document.addEventListener('DOMContentLoaded', function () {
  const quickViewButtons = document.querySelectorAll('.quick-view');
  const modal = document.getElementById('quick-view-modal');
  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const modalRating = document.getElementById('modal-rating');
  const modalPrice = document.getElementById('modal-price');
  const closeBtn = document.querySelector('.close-btn');

  quickViewButtons.forEach(button => {
    button.addEventListener('click', function () {
      const card = this.closest('.product-card');
      const imgSrc = card.querySelector('.product-img')?.src || './img/NAME.avif';
      const name = card.querySelector('.product-name')?.textContent || 'Tên sản phẩm';
      const rating = card.querySelector('.rating-text')?.textContent || '(0)';
      const price = card.querySelector('.current-price')?.textContent || '0₫';
      const oldPrice = card.querySelector('.old-price')?.textContent || '';

      modalImg.src = imgSrc;
      modalName.textContent = name;
      modalRating.textContent = `Đánh giá: ${rating}`;
      modalPrice.textContent = `${price} ${oldPrice ? '(Giá gốc: ' + oldPrice + ')' : ''}`;

      modal.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Đóng modal khi bấm ra ngoài nội dung
  window.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Đóng modal bằng phím ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
});