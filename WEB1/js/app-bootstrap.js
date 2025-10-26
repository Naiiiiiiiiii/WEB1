import { API_BASE } from "./api-config.js";

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// Tải sản phẩm từ API và gán vào globals cho các script render sử dụng
async function loadProducts() {
  const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
  const list = await res.json();

  window.productDataList = Array.isArray(list) ? list : [];
  if (typeof window.Product !== "undefined") {
    try {
      window.products = window.productDataList.map((d) => new Product(d));
    } catch {
      window.products = window.productDataList.slice();
    }
  } else {
    window.products = window.productDataList.slice();
  }
}

// Tải danh mục từ API; nếu không có, suy diễn từ danh mục trong products
async function loadCategories() {
  let ok = false;
  try {
    const res = await fetch(`${API_BASE}/api/categories`, {
      cache: "no-store",
    });
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length) {
        window.categories = list;
        ok = true;
      }
    }
  } catch {
    // ignore, fallback bên dưới
  }

  if (!ok) {
    // Fallback: suy diễn từ products (mọi danh mục mặc định hidden=false)
    const src =
      Array.isArray(window.productDataList) && window.productDataList.length
        ? window.productDataList
        : Array.isArray(window.products)
        ? window.products
        : [];
    const names = Array.from(
      new Set(src.map((p) => p.category).filter(Boolean))
    );
    const now = Date.now();
    window.categories = names.map((n, i) => ({
      id: `C${(i + 1).toString().padStart(3, "0")}`,
      code: String(n).toUpperCase().replace(/\s+/g, "_"),
      name: n,
      desc: "",
      hidden: false,
      createdAt: now,
    }));
  }

  // Lưu set các tên danh mục ẩn đã normalized để debug/so khớp
  window.__hiddenCatSet = new Set(
    (Array.isArray(window.categories) ? window.categories : [])
      .filter((c) => c && c.hidden)
      .map((c) => norm(c.name))
  );

  // Debug nhẹ
  try {
    console.info(
      "[bootstrap] products:",
      Array.isArray(window.products) ? window.products.length : 0,
      "categories:",
      Array.isArray(window.categories) ? window.categories.length : 0,
      "hiddenCatCount:",
      window.__hiddenCatSet.size
    );
  } catch {}
}

// Thiết lập live update: lắng nghe kênh 'products-sync' và tự reload trang user khi có cập nhật
function setupLiveUpdate() {
  try {
    const bc = new BroadcastChannel("products-sync");
    bc.onmessage = (ev) => {
      const data = ev?.data || {};
      if (data.type !== "updated") return;

      const isAdmin = /admin-index\.html($|\?)/.test(window.location.pathname);
      if (isAdmin) return;

      window.location.reload();
    };
    window.__productsSyncChannel = bc;
  } catch (e) {
    console.warn(
      "[live-update] BroadcastChannel not available:",
      e?.message || e
    );
  }
}

// Sau khi có dữ liệu, mới nạp các script render phụ thuộc vào window.products
(async function bootstrap() {
  try {
    await loadProducts();
    await loadCategories();
  } catch (e) {
    console.error("Load data error", e);
    window.productDataList = window.productDataList || [];
    window.products = window.products || [];
    window.categories = window.categories || [];
    window.__hiddenCatSet = window.__hiddenCatSet || new Set();
  } finally {
    const scriptsToLoad = [
      "./js/renderProducts.js",
      "./js/quickview.js",
      // "./js/search-overlay.js",
    ];
    for (const src of scriptsToLoad) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.appendChild(s);
      });
    }
    try {
      window.dispatchEvent(new CustomEvent("productsReady"));
      window.dispatchEvent(new CustomEvent("categoriesReady"));
      window.dispatchEvent(new CustomEvent("catalogReady"));
    } catch {}
    setupLiveUpdate();
  }
})();
