// Áp đè dữ liệu productDataList bằng bản override từ localStorage để người dùng thấy thay đổi
(function () {
  const OVERRIDE_KEY = "productData_overrides";

  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }

  function getOverride() {
    try {
      return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function mergeById(baseList, overrideList) {
    if (!Array.isArray(baseList)) return [];
    const merged = deepClone(baseList);
    const map = new Map(merged.map((x) => [String(x.id), x]));

    if (Array.isArray(overrideList)) {
      overrideList.forEach((ov) => {
        const id = String(ov.id);
        if (map.has(id)) {
          const b = map.get(id);
          // Ghi đè các trường hiển thị chính
          b.name = ov.name ?? b.name;
          b.category = ov.category ?? b.category;
          b.img = ov.img ?? b.img;
          b.description = ov.description ?? b.description;
          b.hidden = ov.hidden ?? b.hidden;
        } else {
          // Sản phẩm mới: thêm vào
          merged.push({
            id: ov.id,
            name: ov.name || "",
            category: ov.category || "",
            price: null,
            oldPrice: null,
            img: ov.img || "",
            rating: 0,
            ratingCount: 0,
            badge: null,
            description: ov.description || "",
            images: ov.img ? [ov.img] : [],
            hidden: !!ov.hidden,
          });
        }
      });
    }
    return merged;
  }

  function applyOverride() {
    if (
      typeof window.productDataList === "undefined" ||
      !Array.isArray(window.productDataList)
    )
      return;
    const override = getOverride();
    const merged = mergeById(window.productDataList, override);

    // Ghi đè vào global để các script sau dùng dữ liệu mới
    window.productDataList = merged;

    // Khởi tạo lại products từ Product class (nếu có)
    if (typeof window.Product !== "undefined") {
      window.products = window.productDataList.map((d) => new Product(d));
    }

    // Phát sự kiện để trang có thể re-render nếu có lắng nghe
    const ev = new CustomEvent("productDataUpdated", {
      detail: { source: "override" },
    });
    window.dispatchEvent(ev);
  }

  // Áp dụng ngay khi script nạp
  try {
    applyOverride();
  } catch (e) {
    console.warn("[productData-override] apply failed", e);
  }

  // Nếu localStorage thay đổi (tab khác), cập nhật lại
  window.addEventListener("storage", (ev) => {
    if (ev.key === OVERRIDE_KEY) {
      try {
        applyOverride();
      } catch {}
    }
  });
})();
