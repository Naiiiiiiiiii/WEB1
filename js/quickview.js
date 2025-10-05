document.addEventListener('DOMContentLoaded', function () {
<<<<<<< HEAD
=======
  const quickViewButtons = document.querySelectorAll('.quick-view');
>>>>>>> 3f9c09077d84470ffb32cc3d92cb7b61faf482eb
  const modal = document.getElementById('quick-view-modal');
  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const modalRating = document.getElementById('modal-rating');
  const modalPrice = document.getElementById('modal-price');
  const closeBtn = document.querySelector('.close-btn');

<<<<<<< HEAD
  function attachQuickViewEvents() {
    const quickViewButtons = document.querySelectorAll('.quick-view');
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
  }

  // Lần đầu khi DOM sẵn sàng
  attachQuickViewEvents();

  // 👉 Mỗi lần sản phẩm render lại (từ search.js), gắn lại quick-view
  document.addEventListener('productsRendered', attachQuickViewEvents);

  // Đóng modal
=======
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

>>>>>>> 3f9c09077d84470ffb32cc3d92cb7b61faf482eb
  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

<<<<<<< HEAD
=======
  // Đóng modal khi bấm ra ngoài nội dung
>>>>>>> 3f9c09077d84470ffb32cc3d92cb7b61faf482eb
  window.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

<<<<<<< HEAD
=======
  // Đóng modal bằng phím ESC
>>>>>>> 3f9c09077d84470ffb32cc3d92cb7b61faf482eb
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> 3f9c09077d84470ffb32cc3d92cb7b61faf482eb
