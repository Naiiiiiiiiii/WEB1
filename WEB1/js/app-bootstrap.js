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
      // TODO: thêm các script render khác của bạn nếu có
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
  }
})();
