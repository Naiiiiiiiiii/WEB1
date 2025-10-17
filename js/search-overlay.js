/**
 * search-overlay.js - TÌM KIẾM DẠNG OVERLAY TRÊN TRANG CHỦ
 * Thay thế search.html bằng overlay popup
 */

(function() {
    'use strict';
    
    // =========================================================================
    // 1. HTML OVERLAY
    // =========================================================================
    const SEARCH_OVERLAY_HTML = `
        <div id="search-overlay" class="search-overlay">
            <div class="search-overlay-content">
                <!-- Close Button -->
                <button class="search-close" aria-label="Đóng tìm kiếm">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Search Header -->
                <div class="search-overlay-header">
                    <h2 class="search-overlay-title">
                        <i class="fas fa-search"></i>
                        Tìm kiếm sản phẩm
                    </h2>
                    <p class="search-overlay-subtitle">Tìm đôi giày hoàn hảo cho bạn</p>
                </div>

                <!-- Search Box -->
                <div class="search-overlay-box-container">
                    <div class="search-overlay-box">
                        <i class="fas fa-search search-overlay-icon"></i>
                        <input 
                            type="text" 
                            id="overlaySearchInput" 
                            class="search-overlay-input" 
                            placeholder="Tìm kiếm theo tên sản phẩm..."
                            autocomplete="off">
                        <button id="overlayClearBtn" class="overlay-clear-btn" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <button id="overlayAdvancedToggle" class="overlay-advanced-toggle">
                        <i class="fas fa-sliders-h"></i>
                        Tìm kiếm nâng cao
                    </button>
                </div>

                <!-- Advanced Panel -->
                <div id="overlayAdvancedPanel" class="overlay-advanced-panel">
                    <h3 class="overlay-advanced-title">
                        <i class="fas fa-filter"></i>
                        Bộ lọc nâng cao
                    </h3>
                    
                    <div class="overlay-advanced-filters">
                        <div class="overlay-filter-group">
                            <label class="overlay-filter-label"><i class="fas fa-tag"></i> Danh mục</label>
                            <select id="overlayCategoryFilter" class="overlay-filter-select">
                                <option value="">Tất cả danh mục</option>
                                <option value="Giày thể thao">Giày thể thao</option>
                                <option value="Giày công sở">Giày công sở</option>
                                <option value="Giày casual">Giày casual</option>
                            </select>
                        </div>

                        <div class="overlay-filter-group">
                            <label class="overlay-filter-label"><i class="fas fa-dollar-sign"></i> Khoảng giá</label>
                            <div class="overlay-price-inputs">
                                <input type="number" id="overlayMinPrice" class="overlay-price-input" placeholder="Từ (VNĐ)" min="0" step="100000">
                                <span class="overlay-price-separator">-</span>
                                <input type="number" id="overlayMaxPrice" class="overlay-price-input" placeholder="Đến (VNĐ)" min="0" step="100000">
                            </div>
                            <div class="overlay-price-presets">
                                <button class="overlay-preset-btn" data-min="0" data-max="1000000">Dưới 1 triệu</button>
                                <button class="overlay-preset-btn" data-min="1000000" data-max="3000000">1-3 triệu</button>
                                <button class="overlay-preset-btn" data-min="3000000" data-max="5000000">3-5 triệu</button>
                                <button class="overlay-preset-btn" data-min="5000000" data-max="999999999">Trên 5 triệu</button>
                            </div>
                        </div>

                        <div class="overlay-filter-actions">
                            <button id="overlayApplyFilters" class="overlay-btn-apply"><i class="fas fa-check"></i> Áp dụng</button>
                            <button id="overlayResetFilters" class="overlay-btn-reset"><i class="fas fa-redo"></i> Đặt lại</button>
                        </div>
                    </div>
                </div>

                <!-- Results -->
                <div class="search-overlay-results">
                    <div class="overlay-results-header">
                        <h3 id="overlayResultsTitle" class="overlay-results-title">Kết quả tìm kiếm</h3>
                        <div id="overlayResultsCount" class="overlay-results-count"></div>
                    </div>

                    <div id="overlayLoadingSpinner" class="overlay-loading-spinner" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tìm kiếm...</p>
                    </div>

                    <div id="overlayNoResults" class="overlay-no-results" style="display: none;">
                        <i class="fas fa-search"></i>
                        <h3>Không tìm thấy sản phẩm</h3>
                        <p>Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc</p>
                    </div>

                    <div id="overlaySearchResults" class="overlay-product-grid"></div>
                </div>
            </div>
        </div>
    `;

    // =========================================================================
    // 2. KHỞI TẠO
    // =========================================================================
    
    let elements = {};
    let searchTimeout = null;
    let currentFilters = { keyword: '', category: '', minPrice: null, maxPrice: null };
    let cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');

    // Inject overlay vào body khi DOM loaded
    function injectOverlay() {
        if (document.getElementById('search-overlay')) return; // Đã tồn tại
        
        const div = document.createElement('div');
        div.innerHTML = SEARCH_OVERLAY_HTML;
        document.body.appendChild(div.firstElementChild);
        
        // Gán elements
        elements = {
            overlay: document.getElementById('search-overlay'),
            closeBtn: document.querySelector('.search-close'),
            searchInput: document.getElementById('overlaySearchInput'),
            clearBtn: document.getElementById('overlayClearBtn'),
            advancedToggle: document.getElementById('overlayAdvancedToggle'),
            advancedPanel: document.getElementById('overlayAdvancedPanel'),
            categoryFilter: document.getElementById('overlayCategoryFilter'),
            minPriceInput: document.getElementById('overlayMinPrice'),
            maxPriceInput: document.getElementById('overlayMaxPrice'),
            applyBtn: document.getElementById('overlayApplyFilters'),
            resetBtn: document.getElementById('overlayResetFilters'),
            resultsTitle: document.getElementById('overlayResultsTitle'),
            resultsCount: document.getElementById('overlayResultsCount'),
            loadingSpinner: document.getElementById('overlayLoadingSpinner'),
            noResults: document.getElementById('overlayNoResults'),
            searchResults: document.getElementById('overlaySearchResults'),
            presetBtns: document.querySelectorAll('.overlay-preset-btn')
        };
        
        setupEventListeners();
    }

    // =========================================================================
    // 3. OPEN/CLOSE OVERLAY
    // =========================================================================
    
    function openSearchOverlay() {
        if (!elements.overlay) injectOverlay();
        
        elements.overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
        
        // Focus vào ô tìm kiếm
        setTimeout(() => elements.searchInput.focus(), 100);
        
        // Load initial results
        performSearch();
    }

    function closeSearchOverlay() {
        if (!elements.overlay) return;
        
        elements.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // =========================================================================
    // 4. SEARCH LOGIC (Giống search.js)
    // =========================================================================
    
    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createProductCard(product) {
        const badgeText = product.getBadgeText();
        const badgeHtml = product.badge
            ? `<div class="product-badge ${escapeHtml(product.badge)}">${escapeHtml(badgeText)}</div>`
            : '';

        const imgHtml = product.img
            ? `<img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}" class="product-img">`
            : `<i class="fas fa-shoe-prints product-icon"></i>`;

        const priceHtml = product.oldPrice
            ? `<span class="current-price">${product.getFormattedPrice()}</span> <span class="old-price">${product.getFormattedOldPrice()}</span>`
            : `<span class="current-price">${product.getFormattedPrice()}</span>`;

        const ratingHtml = `<div class="product-rating"><div class="stars">${product.renderStars()}</div><span class="rating-text">(${product.ratingCount || 0})</span></div>`;

        return `
            <div class="product-card" data-id="${product.id}">
                ${badgeHtml}
                <div class="product-image">
                    ${imgHtml}
                    <div class="product-overlay">
                        <button type="button" class="quick-view" data-id="${product.id}">
                            <i class="fas fa-eye"></i> Xem nhanh
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    ${ratingHtml}
                    <div class="product-price">${priceHtml}</div>
                    <button type="button" class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        `;
    }

    function filterProducts() {
        const keyword = currentFilters.keyword.toLowerCase();
        const category = currentFilters.category.toLowerCase();
        const minPrice = currentFilters.minPrice;
        const maxPrice = currentFilters.maxPrice;

        return products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(keyword);
            const categoryMatch = !category || product.category.toLowerCase() === category;
            const priceMatch = (minPrice === null || product.price >= minPrice) &&
                               (maxPrice === null || product.price <= maxPrice);
            return nameMatch && categoryMatch && priceMatch;
        });
    }

    function renderResults(filteredProducts) {
        elements.loadingSpinner.style.display = 'none';
        elements.searchResults.innerHTML = '';
        elements.resultsCount.textContent = `${filteredProducts.length} kết quả`;

        if (filteredProducts.length === 0) {
            elements.noResults.style.display = 'block';
        } else {
            elements.noResults.style.display = 'none';
            const html = filteredProducts.map(createProductCard).join('');
            elements.searchResults.innerHTML = html;
        }
        
        // Gắn sự kiện quick view
        if (typeof window.attachQuickViewEvents === 'function') {
            window.attachQuickViewEvents();
        }
        
        attachProductEventListeners();
    }

    function performSearch() {
        elements.loadingSpinner.style.display = 'block';
        elements.searchResults.innerHTML = '';
        elements.noResults.style.display = 'none';

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filteredProducts = filterProducts();
            renderResults(filteredProducts);
        }, 300);
    }

    function handleSearchInput() {
        const keyword = elements.searchInput.value.trim();
        currentFilters.keyword = keyword;
        elements.clearBtn.style.display = keyword ? 'flex' : 'none';
        performSearch();
    }

    function clearSearch() {
        elements.searchInput.value = '';
        currentFilters.keyword = '';
        elements.clearBtn.style.display = 'none';
        performSearch();
    }

    function toggleAdvancedPanel() {
        const isHidden = elements.advancedPanel.style.display === 'none' || !elements.advancedPanel.style.display;
        elements.advancedPanel.style.display = isHidden ? 'block' : 'none';
    }

    function applyFilters() {
        currentFilters.category = elements.categoryFilter.value;
        const minVal = parseFloat(elements.minPriceInput.value);
        const maxVal = parseFloat(elements.maxPriceInput.value);

        currentFilters.minPrice = isNaN(minVal) ? null : minVal;
        currentFilters.maxPrice = isNaN(maxVal) ? null : maxVal;
        
        elements.advancedPanel.style.display = 'none';
        performSearch();
    }

    function resetFilters() {
        elements.categoryFilter.value = '';
        elements.minPriceInput.value = '';
        elements.maxPriceInput.value = '';
        elements.searchInput.value = '';
        elements.clearBtn.style.display = 'none';

        currentFilters = { keyword: '', category: '', minPrice: null, maxPrice: null };
        performSearch();
    }

    function attachProductEventListeners() {
        elements.searchResults.removeEventListener('click', searchResultsClickHandler);
        elements.searchResults.addEventListener('click', searchResultsClickHandler);
    }
    
    function searchResultsClickHandler(e) {
        const add = e.target.closest('.add-to-cart');
        if (add) {
            e.preventDefault();
            const id = add.dataset.id;
            if (id && typeof window.addToCart === 'function') {
                window.addToCart(id, 1);
            }
            return;
        }
    }

    // =========================================================================
    // 5. EVENT LISTENERS
    // =========================================================================
    
    function setupEventListeners() {
        // Close overlay
        elements.closeBtn.addEventListener('click', closeSearchOverlay);
        elements.overlay.addEventListener('click', (e) => {
            if (e.target === elements.overlay) closeSearchOverlay();
        });
        
        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.overlay.classList.contains('active')) {
                closeSearchOverlay();
            }
        });
        
        // Search & filters
        elements.searchInput.addEventListener('input', handleSearchInput);
        elements.clearBtn.addEventListener('click', clearSearch);
        elements.advancedToggle.addEventListener('click', toggleAdvancedPanel);
        elements.applyBtn.addEventListener('click', applyFilters);
        elements.resetBtn.addEventListener('click', resetFilters);
        
        // Price presets
        elements.presetBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                elements.minPriceInput.value = this.dataset.min;
                elements.maxPriceInput.value = this.dataset.max;
                applyFilters();
            });
        });
    }

    // =========================================================================
    // 6. GẮNG SỰ KIỆN CHO ICON SEARCH TRÊN HEADER
    // =========================================================================
    
    function initSearchIcon() {
        const searchLink = document.getElementById('search-link');
        if (searchLink) {
            searchLink.addEventListener('click', (e) => {
                e.preventDefault();
                openSearchOverlay();
            });
        }
    }

    // =========================================================================
    // 7. AUTO INIT
    // =========================================================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectOverlay();
            initSearchIcon();
        });
    } else {
        injectOverlay();
        initSearchIcon();
    }

    // Export hàm public
    window.openSearchOverlay = openSearchOverlay;
    window.closeSearchOverlay = closeSearchOverlay;

})();