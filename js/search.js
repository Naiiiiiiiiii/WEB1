/**
 * search.js - Updated
 * Chức năng tìm kiếm cho ShoeStore
 * Yêu cầu: Product.js và productData.js phải được load trước
 */

(function() {
    'use strict';

    // Kiểm tra mảng sản phẩm có tồn tại không
    if (typeof products === 'undefined') {
        console.error('Không tìm thấy mảng sản phẩm. Hãy chắc chắn Product.js và productData.js được load trước search.js');
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
        modalAddBtn: document.getElementById('modal-add-to-cart'),
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

    // Giỏ hàng
    let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');

    // === Helper Functions ===
    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // === Cart Functions ===
    function updateCartCount() {
        const cartCountEl = document.querySelector('.cart-count');
        const count = cart.reduce((s, item) => s + (item.qty || 1), 0);
        if (cartCountEl) cartCountEl.textContent = count;
        localStorage.setItem('cart_shoestore', JSON.stringify(cart));
    }

    function addToCart(productId, qty = 1) {
        const id = Number(productId);
        const product = products.find(x => x.id === id);
        if (!product) return;
        
        const existing = cart.find(i => i.id === id);
        if (existing) {
            existing.qty = (existing.qty || 1) + qty;
        } else {
            cart.push({ 
                id: product.id, 
                name: product.name, 
                price: product.price, 
                qty 
            });
        }
        updateCartCount();
    }

    // === Modal Functions ===
    function openQuickView(productId) {
        const id = Number(productId);
        const product = products.find(x => x.id === id);
        if (!product || !elements.modal) return;

        console.log('Opening quick view for product:', product);

        // Populate modal using Product class methods
        if (elements.modalImg) {
            elements.modalImg.src = product.img || './img/NAME.avif';
            elements.modalImg.alt = product.name;
        }
        if (elements.modalName) {
            elements.modalName.textContent = product.name;
        }
        if (elements.modalRating) {
            elements.modalRating.innerHTML = `
                <div class="stars">${product.renderStars()}</div>
                <span class="rating-text">(${product.ratingCount || 0})</span>
            `;
        }
        if (elements.modalPrice) {
            const oldPriceHtml = product.oldPrice 
                ? `<span class="old-price">${product.getFormattedOldPrice()}</span>`
                : '';
            elements.modalPrice.innerHTML = `
                <span class="current-price">${product.getFormattedPrice()}</span> 
                ${oldPriceHtml}
            `;
        }

        // Set dataset cho modal add-to-cart button
        if (elements.modalAddBtn) {
            elements.modalAddBtn.dataset.id = id;
        }

        // Show modal
        elements.modal.style.display = 'flex';
        elements.modal.classList.add('open');
        elements.modal.setAttribute('aria-hidden', 'false');
    }

    function closeQuickView() {
        if (!elements.modal) return;
        elements.modal.style.display = 'none';
        elements.modal.classList.remove('open');
        elements.modal.setAttribute('aria-hidden', 'true');
    }

    // === Product Card Creation ===
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;

        const badgeText = product.getBadgeText();
        const badgeHtml = product.badge ? `
            <div class="product-badge ${escapeHtml(product.badge)}">
                ${escapeHtml(badgeText)}
            </div>` : '';

        const imgHtml = product.img 
            ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" class="product-img">`
            : `<i class="fas fa-shoe-prints product-icon" aria-hidden="true"></i>`;

        const priceHtml = product.oldPrice
            ? `<span class="current-price">${product.getFormattedPrice()}</span> 
               <span class="old-price">${product.getFormattedOldPrice()}</span>`
            : `<span class="current-price">${product.getFormattedPrice()}</span>`;

        const ratingHtml = `
            <div class="product-rating">
                <div class="stars">${product.renderStars()}</div>
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

    // === Search Functions ===
    function filterProducts() {
        if (!Array.isArray(products)) {
            console.error('Products không phải là mảng');
            return [];
        }

        return products.filter(product => {
            // Filter by keyword
            if (currentFilters.keyword) {
                const keyword = currentFilters.keyword.toLowerCase();
                const productName = (product.name || '').toLowerCase();
                if (!productName.includes(keyword)) return false;
            }
            
            // Filter by category
            if (currentFilters.category) {
                if (product.category !== currentFilters.category) return false;
            }
            
            // Filter by min price
            if (currentFilters.minPrice !== null) {
                if ((product.price || 0) < currentFilters.minPrice) return false;
            }
            
            // Filter by max price
            if (currentFilters.maxPrice !== null) {
                if ((product.price || 0) > currentFilters.maxPrice) return false;
            }
            
            return true;
        });
    }

    function renderProducts(productsList) {
        elements.searchResults.innerHTML = '';
        const fragment = document.createDocumentFragment();
        productsList.forEach(product => {
            const card = createProductCard(product);
            fragment.appendChild(card);
        });
        elements.searchResults.appendChild(fragment);
    }

    function performSearch() {
        showLoading();
        setTimeout(() => {
            const results = filterProducts();
            displayResults(results);
        }, 300);
    }

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

    function updateResultsCount(count) {
        elements.resultsCount.textContent = `Tìm thấy ${count} sản phẩm`;
        elements.resultsCount.classList.add('highlight');
        setTimeout(() => elements.resultsCount.classList.remove('highlight'), 500);
    }

    function updateResultsTitle() {
        let title = 'Kết quả tìm kiếm';
        if (currentFilters.keyword) {
            title = `Kết quả cho "${currentFilters.keyword}"`;
        } else if (currentFilters.category || currentFilters.minPrice !== null || currentFilters.maxPrice !== null) {
            title = 'Kết quả lọc';
        }
        elements.resultsTitle.textContent = title;
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

    // === Event Handlers ===
    function handleSearchInput() {
        const value = elements.searchInput.value.trim();
        elements.clearSearchBtn.style.display = value ? 'flex' : 'none';

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentFilters.keyword = value;
            performSearch();
        }, 500);
    }

    function clearSearch() {
        elements.searchInput.value = '';
        elements.clearSearchBtn.style.display = 'none';
        currentFilters.keyword = '';
        elements.searchInput.focus();
        performSearch();
    }

    function toggleAdvancedPanel() {
        elements.advancedPanel.classList.toggle('active');
        elements.advancedToggle.classList.toggle('active');
    }

    function handlePresetClick() {
        const min = this.dataset.min;
        const max = this.dataset.max;
        
        elements.minPriceInput.value = min;
        elements.maxPriceInput.value = max === '999999999' ? '' : max;

        elements.presetBtns.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    }

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

    // === Setup Event Listeners ===
    function setupEventListeners() {
        // Search input
        elements.searchInput.addEventListener('input', handleSearchInput);
        elements.clearSearchBtn.addEventListener('click', clearSearch);
        
        // Advanced panel
        elements.advancedToggle.addEventListener('click', toggleAdvancedPanel);
        
        // Filters
        elements.applyFiltersBtn.addEventListener('click', applyFilters);
        elements.resetFiltersBtn.addEventListener('click', resetFilters);

        // Preset buttons
        elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', handlePresetClick);
        });

        // Enter key
        elements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });

        // Event delegation cho quick-view và add-to-cart
        elements.searchResults.addEventListener('click', function (e) {
            // Quick View
            const qv = e.target.closest('.quick-view');
            if (qv) {
                e.preventDefault();
                const id = qv.dataset.id;
                console.log('Quick view clicked for ID:', id);
                openQuickView(id);
                return;
            }

            // Add to Cart
            const add = e.target.closest('.add-to-cart');
            if (add) {
                e.preventDefault();
                const id = add.dataset.id;
                addToCart(id, 1);
                add.classList.add('added');
                setTimeout(() => add.classList.remove('added'), 600);
                return;
            }
        });

        // Modal close button
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeQuickView();
            });
        }

        // Modal overlay click
        if (elements.modal) {
            elements.modal.addEventListener('click', function(e) {
                if (e.target === elements.modal) {
                    closeQuickView();
                }
            });
        }

        // ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeQuickView();
            }
        });

        // Modal add to cart button
        if (elements.modalAddBtn) {
            elements.modalAddBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = this.dataset.id;
                if (id) {
                    addToCart(id, 1);
                    closeQuickView();
                }
            });
        }
    }

    // === Init ===
    function init() {
        if (!elements.searchInput) {
            console.error('Không tìm thấy các phần tử tìm kiếm trong DOM');
            return;
        }

        setupEventListeners();
        updateCartCount();
        loadInitialSearch();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();