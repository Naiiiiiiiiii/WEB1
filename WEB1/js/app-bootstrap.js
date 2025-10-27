import { API_BASE } from "./api-config.js";

// Tải sản phẩm từ API và gán vào globals cho các script render sử dụng
async function loadProducts() {
  const res = await fetch(`${API_BASE}/api/products`, { cache: "no-store" });
  const list = await res.json();

  window.productDataList = Array.isArray(list) ? list : [];
  // Nếu dự án bạn có class Product, có thể khởi tạo instance. Nếu không, dùng mảng object.
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

// Thiết lập live update: lắng nghe kênh 'products-sync' và tự reload trang user khi có cập nhật
function setupLiveUpdate() {
  try {
    const bc = new BroadcastChannel("products-sync");
    bc.onmessage = async (ev) => {
      const data = ev?.data || {};
      if (data.type !== "updated") return;

      // Bỏ qua nếu đang ở trang admin
      const isAdmin = /admin-index\.html($|\?)/.test(window.location.pathname);
      if (isAdmin) return;

      // Reload nhẹ để đảm bảo renderProducts.js nạp lại với dữ liệu mới
      // (giúp tránh duplicate event listeners nếu nạp script động nhiều lần)
      try {
        // Nếu muốn chỉ refetch mà không reload trang:
        // await loadProducts();
        // window.ProductRenderer?.refresh?.(window.products);
        // Tuy nhiên reload là chắc chắn và sạch:
        window.location.reload();
      } catch {
        window.location.reload();
      }
    };

    // Lưu tham chiếu nếu cần debug
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
  } catch (e) {
    console.error("Load products error", e);
    window.productDataList = window.productDataList || [];
    window.products = window.products || [];
  } finally {
    const scriptsToLoad = [
      "./js/renderProducts.js",
      "./js/quickview.js",
      // Nếu chức năng search phụ thuộc dữ liệu, giữ lại dòng dưới:
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
    // Thông báo đã sẵn sàng (nếu các script khác cần lắng nghe)
    try {
      window.dispatchEvent(new CustomEvent("productsReady"));
    } catch {}

    // Bật Live Update listener
    setupLiveUpdate();
  }
})();
