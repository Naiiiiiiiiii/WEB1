// Admin 4: Quản lý sản phẩm
// Lưu trữ: localStorage key 'admin_products'
// Liên kết danh mục qua window.AdminCatalog (admin-categories.js)

(function () {
  const PROD_KEY = "admin_products";
  const CAT_KEY = "admin_categories"; // fallback nếu AdminCatalog chưa sẵn sàng

  // Seed mẫu nếu trống
  function seedIfEmpty() {
    const list = getProducts();
    if (list.length) return;
    const cats = getCategories();
    if (!cats.length) return;

    // Tạo một vài sản phẩm mẫu map theo các danh mục sẵn có
    const p = [];
    const cSport = cats.find((c) => c.code === "SPT") || cats[0];
    const cFormal = cats.find((c) => c.code === "SCS") || cats[0];
    const cCasual = cats.find((c) => c.code === "SCA") || cats[0];

    p.push(
      newProd(
        "P001",
        "Giày thể thao CA Match",
        cSport.id,
        "./img/giaythethao_CAMatch.avif",
        "Đế cao su bền bỉ, thoáng khí",
        false
      )
    );
    p.push(
      newProd(
        "P002",
        "Suede Classic Unisex",
        cSport.id,
        "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
        "Retro, da lộn cao cấp",
        false
      )
    );
    p.push(
      newProd(
        "P003",
        "Giày công sở Germano Bellesi",
        cFormal.id,
        "./img/giaycongsoGERMANO.webp",
        "Da thật, sản xuất thủ công",
        false
      )
    );
    p.push(
      newProd(
        "P004",
        "MATURE Chelsea Boots",
        cFormal.id,
        "./img/bootsnam.webp",
        "Thiết kế tối giản, lịch lãm",
        false
      )
    );
    p.push(
      newProd(
        "P005",
        "Sneaker DYNAMIC – Vàng bò",
        cCasual.id,
        "./img/casual_Dynamic.webp",
        "Trẻ trung, êm ái",
        false
      )
    );
    p.push(
      newProd(
        "P006",
        "Warrior 2025",
        cCasual.id,
        "./img/casual_Warrior.png",
        "Nhẹ, bền, giá hợp lý",
        true
      )
    ); // ví dụ ẩn

    saveProducts(p);
  }

  function newProd(code, name, categoryId, image, desc, hidden) {
    return {
      id: genId(),
      code,
      name,
      categoryId,
      image: image || "",
      desc: desc || "",
      hidden: !!hidden,
      createdAt: Date.now(),
    };
  }

  function genId() {
    return "P" + Math.random().toString(36).slice(2, 9).toUpperCase();
  }

  function getProducts() {
    try {
      return JSON.parse(localStorage.getItem(PROD_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveProducts(list) {
    localStorage.setItem(PROD_KEY, JSON.stringify(list));
    updateProductCount();
  }

  function getCategories() {
    if (
      window.AdminCatalog &&
      typeof window.AdminCatalog.getCategories === "function"
    ) {
      return window.AdminCatalog.getCategories();
    }
    try {
      return JSON.parse(localStorage.getItem(CAT_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function updateProductCount() {
    const el = document.getElementById("countProducts");
    if (el) el.textContent = `Số sản phẩm hiện có: ${getProducts().length}`;
  }

  // UI refs
  const els = {
    search: null,
    filterCat: null,
    filterStatus: null,
    tbody: null,
    form: null,
    id: null,
    code: null,
    name: null,
    category: null,
    image: null,
    desc: null,
    hidden: null,
    resetBtn: null,
  };

  function bindEls() {
    els.search = document.getElementById("productSearch");
    els.filterCat = document.getElementById("productFilterCategory");
    els.filterStatus = document.getElementById("productFilterStatus");
    els.tbody = document.getElementById("productsTableBody");

    els.form = document.getElementById("productForm");
    els.id = document.getElementById("productId");
    els.code = document.getElementById("productCode");
    els.name = document.getElementById("productName");
    els.category = document.getElementById("productCategory");
    els.image = document.getElementById("productImage");
    els.desc = document.getElementById("productDesc");
    els.hidden = document.getElementById("productHidden");
    els.resetBtn = document.getElementById("resetProductFormBtn");
  }

  function populateCategorySelect() {
    const cats = getCategories();
    // Bộ lọc
    if (els.filterCat) {
      const current = els.filterCat.value || "all";
      els.filterCat.innerHTML =
        `<option value="all">Tất cả</option>` +
        cats
          .map(
            (c) =>
              `<option value="${c.id}">${c.name}${
                c.hidden ? " (ẩn)" : ""
              }</option>`
          )
          .join("");
      els.filterCat.value = current;
    }
    // Select trong Form
    if (els.category) {
      const current = els.category.value || "";
      els.category.innerHTML = cats
        .filter((c) => !c.hidden) // chỉ cho chọn danh mục đang hiển thị
        .map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("");
      if (current) els.category.value = current;
    }
  }

  function render() {
    const list = getProducts();
    const q = (els.search?.value || "").toLowerCase().trim();
    const catId = els.filterCat?.value || "all";
    const st = els.filterStatus?.value || "all";
    const cats = getCategories();
    const catMap = new Map(cats.map((c) => [String(c.id), c]));

    const filtered = list.filter((p) => {
      const okSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      const okCat = catId === "all" || String(p.categoryId) === String(catId);
      const okStatus = st === "all" || (st === "hidden" ? p.hidden : !p.hidden);
      return okSearch && okCat && okStatus;
    });

    els.tbody.innerHTML = filtered
      .map((p) => {
        const c = catMap.get(String(p.categoryId));
        const catName = c ? c.name : "(Không xác định)";
        const statusHtml = p.hidden
          ? '<span class="low">Đang ẩn</span>'
          : '<span class="ok">Hiển thị</span>';
        const imgHtml = p.image
          ? `<img src="${p.image}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px">`
          : "";
        return `
        <tr data-id="${p.id}">
          <td>${p.code}</td>
          <td>${p.name}</td>
          <td>${catName}</td>
          <td>${imgHtml}</td>
          <td>${statusHtml}</td>
          <td class="actions">
            <button class="btn ghost btn-edit">Sửa</button>
            <button class="btn btn-toggle">${p.hidden ? "Bỏ ẩn" : "Ẩn"}</button>
            <button class="btn btn-delete">Xóa</button>
          </td>
        </tr>
      `;
      })
      .join("");

    // Bind actions
    els.tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const p = list.find((x) => x.id === id);
        if (!p) return;
        els.id.value = p.id;
        els.code.value = p.code;
        els.name.value = p.name;
        els.category.value = p.categoryId;
        els.image.value = p.image || "";
        els.desc.value = p.desc || "";
        els.hidden.checked = !!p.hidden;
        els.code.focus();
      });
    });

    els.tbody.querySelectorAll(".btn-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const listAll = getProducts();
        const idx = listAll.findIndex((x) => x.id === id);
        if (idx === -1) return;
        listAll[idx].hidden = !listAll[idx].hidden;
        saveProducts(listAll);
        render();
      });
    });

    els.tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        if (!confirm("Xác nhận xóa sản phẩm?")) return;
        const listAll = getProducts().filter((x) => x.id !== id);
        saveProducts(listAll);
        if (els.id.value === id) resetForm();
        render();
      });
    });
  }

  function resetForm() {
    els.id.value = "";
    els.code.value = "";
    els.name.value = "";
    // fallback: chọn option đầu tiên nếu có
    if (els.category && els.category.options.length) {
      els.category.value = els.category.options[0].value;
    }
    els.image.value = "";
    els.desc.value = "";
    els.hidden.checked = false;
  }

  function onSubmit(e) {
    e.preventDefault();
    const id = (els.id.value || "").trim();
    const code = (els.code.value || "").trim();
    const name = (els.name.value || "").trim();
    const categoryId = els.category.value;
    const image = (els.image.value || "").trim();
    const desc = (els.desc.value || "").trim();
    const hidden = !!els.hidden.checked;

    if (!code || !name || !categoryId) {
      alert("Vui lòng nhập mã, tên và chọn danh mục.");
      return;
    }

    const list = getProducts();
    if (id) {
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          code,
          name,
          categoryId,
          image,
          desc,
          hidden,
        };
      }
      saveProducts(list);
    } else {
      // tránh trùng mã
      if (list.some((x) => x.code.toLowerCase() === code.toLowerCase())) {
        alert("Mã sản phẩm đã tồn tại.");
        return;
      }
      list.push({
        id: genId(),
        code,
        name,
        categoryId,
        image,
        desc,
        hidden,
        createdAt: Date.now(),
      });
      saveProducts(list);
    }
    resetForm();
    render();
  }

  function init() {
    bindEls();
    populateCategorySelect(); // gọi trước seed để có select rỗng an toàn
    seedIfEmpty(); // seed sản phẩm demo nếu trống
    populateCategorySelect(); // gọi lại sau seed danh mục (nếu có)

    els.form?.addEventListener("submit", onSubmit);
    els.resetBtn?.addEventListener("click", resetForm);
    els.search?.addEventListener("input", render);
    els.filterCat?.addEventListener("change", render);
    els.filterStatus?.addEventListener("change", render);

    // Lắng nghe thay đổi danh mục để cập nhật select + render bảng
    if (
      window.AdminCatalog &&
      typeof window.AdminCatalog.onChange === "function"
    ) {
      window.AdminCatalog.onChange(() => {
        populateCategorySelect();
        render();
      });
    }

    render();
    updateProductCount();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
