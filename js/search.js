// Chức năng tìm kiếm cho ShoeStore - Đã cập nhật để đồng nhất với renderProducts.js
(function() {
    'use strict';

    // Kiểm tra mảng sản phẩm có tồn tại không
    if (typeof products === 'undefined') {
        console.error('Không tìm thấy mảng sản phẩm. Hãy chắc chắn products.js được load trước search.js');
        return;
    }

    // Các phần tử DOM
    const elements = {
        searchInput: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        advancedToggle: document.getElementById('advancedToggle'),
        advancedPanel: document.getElementById('advancedPanel'),
        categoryFilter: document.getElementById('categoryFilter'),
        minPriceInput: document.getElementById('minPrice'),
        maxPriceInput: document.getElementById('maxPrice'),
        applyFiltersBtn: document.getElementById('applyFilters'),
        resetFiltersBtn: document.getElementById('resetFilters'),
        searchResults: document.getElementById('searchResults'),
        resultsTitle: document.getElementById('resultsTitle'),
        resultsCount: document.getElementById('resultsCount'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        noResults: document.getElementById('noResults'),
        presetBtns: document.querySelectorAll('.preset-btn'),
        modal: document.getElementById('quick-view-modal'),
        modalImg: document.getElementById('modal-img'),
        modalName: document.getElementById('modal-name'),
        modalRating: document.getElementById('modal-rating'),
        modalPrice: document.getElementById('modal-price'),
        closeBtn: document.querySelector('.close-btn')
    };

    // Trạng thái tìm kiếm
    let searchTimeout = null;
    let currentFilters = {
        keyword: '',
        category: '',
        minPrice: null,
        maxPrice: null
    };

    // --- Quick View và Cart helpers (giống renderProducts.js) ---
    let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');

    function updateCartCount() {
        const cartCountEl = document.querySelector('.cart-count');
        const count = cart.reduce((s, item) => s + (item.qty || 1), 0);
        if (cartCountEl) cartCountEl.textContent = count;
        localStorage.setItem('cart_shoestore', JSON.stringify(cart));
    }

    function addToCart(productId, qty = 1) {
        const id = Number(productId);
        const p = products.find(x => x.id === id);
        if (!p) return;
        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty = (existing.qty || 1) + qty;
        else cart.push({ id: p.id, name: p.name, price: p.price, qty });
        updateCartCount();
    }

    function openQuickView(productId) {
        const id = Number(productId);
        const p = products.find(x => x.id === id);
        if (!p || !elements.modal) return;

        // Populate modal
        if (elements.modalImg) {
            elements.modalImg.src = p.img || './img/NAME.avif';
            elements.modalImg.alt = p.name;
        }
        if (elements.modalName) elements.modalName.textContent = p.name;
        if (elements.modalRating) {
            elements.modalRating.innerHTML = `${renderStars(p.rating)} <span class="rating-text">(${p.ratingCount || 0})</span>`;
        }
        if (elements.modalPrice) {
            elements.modalPrice.innerHTML = `<strong>${formatPrice(p.price)}</strong> ${p.oldPrice ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ''}`;
        }

        // Set dataset cho modal add-to-cart button
        const modalAddBtn = document.getElementById('modal-add-to-cart');
        if (modalAddBtn) modalAddBtn.dataset.id = id;

        // Show modal
        elements.modal.classList.add('open');
        elements.modal.style.display = 'flex';
        elements.modal.setAttribute('aria-hidden', 'false');
    }

    function closeQuickView() {
        if (!elements.modal) return;
        elements.modal.classList.remove('open');
        elements.modal.style.display = 'none';
        elements.modal.setAttribute('aria-hidden', 'true');
    }

    // Khởi tạo
    function init() {
        if (!elements.searchInput) {
            console.error('Không tìm thấy các phần tử tìm kiếm trong DOM');
            return;
        }

        setupEventListeners();
        loadInitialSearch();
        updateCartCount(); // Khởi tạo cart count
    }

    // Thiết lập sự kiện
    function setupEventListeners() {
        // Ô nhập tìm kiếm với debounce
        elements.searchInput.addEventListener('input', handleSearchInput);
        
        // Nút xóa tìm kiếm
        elements.clearSearchBtn.addEventListener('click', clearSearch);
        
        // Nút bật/tắt bộ lọc nâng cao
        elements.advancedToggle.addEventListener('click', toggleAdvancedPanel);
        
        // Các nút lọc
        elements.applyFiltersBtn.addEventListener('click', applyFilters);
        elements.resetFiltersBtn.addEventListener('click', resetFilters);

        // Các nút preset giá
        elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', handlePresetClick);
        });

        // Enter để tìm kiếm
        elements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });

        // Event delegation cho quick-view và add-to-cart (giống renderProducts.js)
        elements.searchResults.addEventListener('click', function (e) {
            // Xử lý Quick View
            const qv = e.target.closest('.quick-view');
            if (qv) {
                const id = qv.dataset.id;
                openQuickView(id);
                return;
            }

            // Xử lý Add to Cart
            const add = e.target.closest('.add-to-cart');
            if (add) {
                const id = add.dataset.id;
                addToCart(id, 1);
                // Hiệu ứng feedback
                add.classList.add('added');
                setTimeout(() => add.classList.remove('added'), 600);
                return;
            }
        });

        // Modal close handlers
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closeQuickView);
        }

        // Đóng modal khi click overlay
        if (elements.modal) {
            elements.modal.addEventListener('click', (e) => {
                if (e.target === elements.modal) closeQuickView();
            });

            // ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeQuickView();
            });
        }

        // Modal add-to-cart button
        const modalAddBtn = document.getElementById('modal-add-to-cart');
        if (modalAddBtn) {
            modalAddBtn.addEventListener('click', function () {
                const id = this.dataset.id;
                if (id) {
                    addToCart(id, 1);
                    closeQuickView();
                }
            });
        }
    }

    // Load tìm kiếm ban đầu từ URL
    function loadInitialSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            elements.searchInput.value = query;
            currentFilters.keyword = query;
            elements.clearSearchBtn.style.display = 'flex';
        }
        
        performSearch();
    }

    // Xử lý nhập tìm kiếm với debounce
    function handleSearchInput() {
        const value = elements.searchInput.value.trim();
        elements.clearSearchBtn.style.display = value ? 'flex' : 'none';

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.keyword = value;
            performSearch();
        }, 500);
    }

    // Xóa tìm kiếm
    function clearSearch() {
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        currentFilters.keyword = '';
        elements.searchInput.focus();
        performSearch();
    }

    // Bật/tắt bảng tìm kiếm nâng cao
    function toggleAdvancedPanel() {
        elements.advancedPanel.classList.toggle('active');
        elements.advancedToggle.classList.toggle('active');
    }

    // Xử lý click preset giá
    function handlePresetClick() {
        const min = this.dataset.min;
        const max = this.dataset.max;
        
        elements.minPriceInput.value = min;
        elements.maxPriceInput.value = max === '999999999' ? '' : max;

        elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    }

    // Áp dụng tất cả bộ lọc
    function applyFilters() {
        currentFilters.keyword = elements.searchInput.value.trim();
        currentFilters.category = elements.categoryFilter.value;
        currentFilters.minPrice = elements.minPriceInput.value ? parseFloat(elements.minPriceInput.value) : null;
        currentFilters.maxPrice = elements.maxPriceInput.value ? parseFloat(elements.maxPriceInput.value) : null;

        if (currentFilters.minPrice !== null && currentFilters.maxPrice !== null) {
            if (currentFilters.minPrice > currentFilters.maxPrice) {
                alert('Giá tối thiểu không thể lớn hơn giá tối đa!');
                return;
            }
        }

        performSearch();
    }

    // Đặt lại tất cả bộ lọc
    function resetFilters() {
        elements.searchInput.value = '';
        elements.categoryFilter.value = '';
        elements.minPriceInput.value = '';
        elements.maxPriceInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        elements.presetBtns.forEach(btn => btn.classList.remove('active'));

        currentFilters = { keyword: '', category: '', minPrice: null, maxPrice: null };
        performSearch();
    }

    // Thực hiện tìm kiếm
    function performSearch() {
        showLoading();
        setTimeout(() => {
            const results = filterProducts();
            displayResults(results);
        }, 300);
    }

    // Lọc sản phẩm
    function filterProducts() {
        if (!Array.isArray(products)) {
            console.error('Products không phải là mảng');
            return [];
        }

        return products.filter(product => {
            if (currentFilters.keyword) {
                const keyword = currentFilters.keyword.toLowerCase();
                const productName = (product.name || '').toLowerCase();
                if (!productName.includes(keyword)) return false;
            }
            if (currentFilters.category) {
                if (product.category !== currentFilters.category) return false;
            }
            if (currentFilters.minPrice !== null) {
                if ((product.price || 0) < currentFilters.minPrice) return false;
            }
            if (currentFilters.maxPrice !== null) {
                if ((product.price || 0) > currentFilters.maxPrice) return false;
            }
            return true;
        });
    }

    // Hiển thị kết quả
    function displayResults(results) {
        hideLoading();
        updateResultsCount(results.length);
        updateResultsTitle();

        if (results.length === 0) {
            elements.searchResults.innerHTML = '';
            elements.noResults.style.display = 'block';
            return;
        }

        elements.noResults.style.display = 'none';
        renderProducts(results);
    }

    // Cập nhật số lượng kết quả
    function updateResultsCount(count) {
        elements.resultsCount.textContent = `Tìm thấy ${count} sản phẩm`;
        elements.resultsCount.classList.add('highlight');
        setTimeout(() => elements.resultsCount.classList.remove('highlight'), 500);
    }

    // Cập nhật tiêu đề kết quả
    function updateResultsTitle() {
        let title = 'Kết quả tìm kiếm';
        if (currentFilters.keyword) {
            title = `Kết quả cho "${currentFilters.keyword}"`;
        } else if (currentFilters.category || currentFilters.minPrice !== null || currentFilters.maxPrice !== null) {
            title = 'Kết quả lọc';
        }
        elements.resultsTitle.textContent = title;
    }

    // Render sản phẩm
    function renderProducts(productsList) {
        elements.searchResults.innerHTML = '';
        const fragment = document.createDocumentFragment();
        productsList.forEach(product => {
            const card = createProductCard(product);
            fragment.appendChild(card);
        });
        elements.searchResults.appendChild(fragment);
    }

    // Tạo thẻ sản phẩm (giống renderProducts.js)
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;

        const badgeHtml = product.badge ? `
            <div class="product-badge ${escapeHtml(product.badge)}">
                ${getBadgeText(product)}
            </div>` : '';

        const imgHtml = product.img 
            ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" class="product-img">`
            : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

        const priceHtml = product.oldPrice
            ? `<span class="current-price">${formatPrice(product.price)}</span> 
               <span class="old-price">${formatPrice(product.oldPrice)}</span>`
            : `<span class="current-price">${formatPrice(product.price)}</span>`;

        const ratingHtml = `
            <div class="product-rating">
                <div class="stars">${renderStars(product.rating)}</div>
                <span class="rating-text">(${product.ratingCount || 0})</span>
            </div>`;

        card.innerHTML = `
            ${badgeHtml}
            <div class="product-image">
                ${imgHtml}
                <div class="product-overlay">
                    <button type="button" class="quick-view" data-id="${product.id}">Xem nhanh</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                ${ratingHtml}
                <div class="product-price">${priceHtml}</div>
                <button type="button" class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>`;

        return card;
    }

    function getBadgeText(product) {
        if (product.badge === 'sale' && product.oldPrice) {
            const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
            return `-${discount}%`;
        }
        const badgeMap = { 'hot': 'Hot', 'new': 'Mới', 'sale': 'Sale' };
        return badgeMap[product.badge] || escapeHtml(product.badge);
    }

    function formatPrice(price) {
        if (price == null || price === '') return '';
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    }

    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderStars(rating) {
        rating = Math.round(rating) || 0;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="${i <= rating ? 'fas' : 'far'} fa-star" aria-hidden="true"></i>`;
        }
        return html;
    }

    function showLoading() {
        elements.loadingSpinner.style.display = 'block';
        elements.searchResults.style.display = 'none';
        elements.noResults.style.display = 'none';
    }

    function hideLoading() {
        elements.loadingSpinner.style.display = 'none';
        elements.searchResults.style.display = 'grid';
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();