// Admin 4 đọc trực tiếp productData.js và cập nhật live UI
// - Nguồn dữ liệu gốc: window.productDataList (từ productData.js)
// - Khi sửa: cập nhật localStorage overrides + cập nhật ngay window.productDataList/window.products
// - Các trang user sẽ tự đọc override qua productData-override.js sau khi reload

(function () {
  const OVERRIDE_KEY = "productData_overrides"; // bản ghi đè
  const CAT_KEY = "admin_categories"; // danh mục quản trị (tùy chọn)

  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }
  function getBaseFromProductData() {
    if (
      typeof productDataList !== "undefined" &&
      Array.isArray(productDataList)
    )
      return deepClone(productDataList);
    return [];
  }
  function getOverride() {
    try {
      return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "null");
    } catch {
      return null;
    }
  }
  function setOverride(list) {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(list));
    updateProductCount();
  }
  function getCurrentProducts() {
    const override = getOverride();
    if (Array.isArray(override)) return override;
    return getBaseFromProductData();
  }

  function applyOverrideToGlobals() {
    // Giống logic trong productData-override.js nhưng chạy ngay trên trang admin
    if (
      typeof window.productDataList === "undefined" ||
      !Array.isArray(window.productDataList)
    )
      return;
    const base = window.productDataList;
    const ov = getOverride();
    const merged = mergeById(base, ov);
    window.productDataList = merged;
    if (typeof window.Product !== "undefined") {
      window.products = window.productDataList.map((d) => new Product(d));
    }
    const ev = new CustomEvent("productDataUpdated", {
      detail: { source: "admin" },
    });
    window.dispatchEvent(ev);
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
          b.name = ov.name ?? b.name;
          b.category = ov.category ?? b.category;
          b.img = ov.img ?? b.img;
          b.description = ov.description ?? b.description;
          b.hidden = ov.hidden ?? b.hidden;
        } else {
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

  function getCategories() {
    try {
      return JSON.parse(localStorage.getItem(CAT_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function updateProductCount() {
    const el = document.getElementById("countProducts");
    if (el)
      el.textContent = `Số sản phẩm hiện có: ${getCurrentProducts().length}`;
  }

  const els = {
    search: null,
    filterCat: null,
    filterStatus: null,
    tbody: null,
    form: null,
    idHidden: null,
    code: null,
    name: null,
    category: null,
    image: null,
    desc: null,
    hidden: null,
    resetBtn: null,
    exportBtn: null,
  };

  function bindEls() {
    els.search = document.getElementById("productSearch");
    els.filterCat = document.getElementById("productFilterCategory");
    els.filterStatus = document.getElementById("productFilterStatus");
    els.tbody = document.getElementById("productsTableBody");

    els.form = document.getElementById("productForm");
    els.idHidden = document.getElementById("productId");
    els.code = document.getElementById("productCode");
    els.name = document.getElementById("productName");
    els.category = document.getElementById("productCategory");
    els.image = document.getElementById("productImage");
    els.desc = document.getElementById("productDesc");
    els.hidden = document.getElementById("productHidden");
    els.resetBtn = document.getElementById("resetProductFormBtn");
    els.exportBtn = document.getElementById("exportProductDataBtn");
  }

  function populateCategorySelect() {
    const cats = getCategories();
    if (els.filterCat) {
      const current = els.filterCat.value || "all";
      els.filterCat.innerHTML =
        `<option value="all">Tất cả</option>` +
        cats
          .map(
            (c) =>
              `<option value="${c.name}">${c.name}${
                c.hidden ? " (ẩn)" : ""
              }</option>`
          )
          .join("");
      els.filterCat.value = current;
    }
    if (els.category) {
      const current = els.category.value || "";
      els.category.innerHTML = cats
        .filter((c) => !c.hidden)
        .map((c) => `<option value="${c.name}">${c.name}</option>`)
        .join("");
      if (current) els.category.value = current;
    }
  }

  function categoriesFromProducts(products) {
    return Array.from(
      new Set((products || []).map((p) => p.category).filter(Boolean))
    );
  }

  function render() {
    let list = getCurrentProducts();
    const q = (els.search?.value || "").toLowerCase().trim();
    const cat = els.filterCat?.value || "all";
    const st = els.filterStatus?.value || "all";

    if (!getCategories().length && els.filterCat && els.category) {
      const cats = categoriesFromProducts(list);
      const currentFilter = els.filterCat.value || "all";
      els.filterCat.innerHTML =
        `<option value="all">Tất cả</option>` +
        cats.map((c) => `<option value="${c}">${c}</option>`).join("");
      els.filterCat.value = currentFilter;

      const currentEdit = els.category.value || "";
      els.category.innerHTML = cats
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("");
      if (currentEdit) els.category.value = currentEdit;
    }

    const filtered = list.filter((p) => {
      const okSearch =
        !q ||
        String(p.id).toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q);
      const okCat = cat === "all" || String(p.category) === String(cat);
      const okStatus = st === "all" || (st === "hidden" ? p.hidden : !p.hidden);
      return okSearch && okCat && okStatus;
    });

    els.tbody.innerHTML = filtered
      .map((p) => {
        const statusHtml = p.hidden
          ? '<span class="low">Đang ẩn</span>'
          : '<span class="ok">Hiển thị</span>';
        const imgHtml = p.img
          ? `<img src="${p.img}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:6px">`
          : "";
        return `
        <tr data-id="${p.id}">
          <td>${p.id}</td>
          <td>${p.name || ""}</td>
          <td>${p.category || ""}</td>
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

    els.tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const listAll = getCurrentProducts();
        const p = listAll.find((x) => String(x.id) === String(id));
        if (!p) return;
        els.idHidden.value = p.id;
        els.code.value = p.id;
        els.code.setAttribute("disabled", "disabled");
        els.name.value = p.name || "";
        els.category.value = p.category || "";
        els.image.value = p.img || "";
        els.desc.value = p.description || "";
        els.hidden.checked = !!p.hidden;
        els.name.focus();
      });
    });

    els.tbody.querySelectorAll(".btn-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const listAll = getCurrentProducts();
        const idx = listAll.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return;
        listAll[idx].hidden = !listAll[idx].hidden;
        setOverride(listAll);
        applyOverrideToGlobals(); // cập nhật ngay dữ liệu đang chạy
        render();
      });
    });

    els.tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        if (!confirm("Xác nhận xóa sản phẩm khỏi danh sách hiện hành?")) return;
        const listAll = getCurrentProducts().filter(
          (x) => String(x.id) !== String(id)
        );
        setOverride(listAll);
        applyOverrideToGlobals();
        if (els.idHidden.value && String(els.idHidden.value) === String(id))
          resetForm();
        render();
      });
    });
  }

  function resetForm() {
    els.idHidden.value = "";
    els.code.value = "";
    els.name.value = "";
    if (els.category && els.category.options.length)
      els.category.value = els.category.options[0].value;
    else els.category.value = "";
    els.image.value = "";
    els.desc.value = "";
    els.hidden.checked = false;
    els.code.removeAttribute("disabled");
  }

  function onSubmit(e) {
    e.preventDefault();
    const oldId = (els.idHidden.value || "").trim();
    const newId = (els.code.value || "").trim();
    const name = (els.name.value || "").trim();
    const category = (els.category.value || "").trim();
    const img = (els.image.value || "").trim();
    const description = (els.desc.value || "").trim();
    const hidden = !!els.hidden.checked;

    if (!newId || !name) {
      alert("Vui lòng nhập mã (id) và tên sản phẩm.");
      return;
    }

    const list = getCurrentProducts();

    if (oldId) {
      const idx = list.findIndex((x) => String(x.id) === String(oldId));
      if (idx === -1) {
        alert("Không tìm thấy sản phẩm để cập nhật.");
        return;
      }
      list[idx] = { ...list[idx], name, category, img, description, hidden };
      setOverride(list);
      applyOverrideToGlobals(); // cập nhật ngay vào productDataList & products
    } else {
      if (list.some((x) => String(x.id) === String(newId))) {
        alert("Mã sản phẩm (id) đã tồn tại.");
        return;
      }
      list.push({ id: newId, name, category, img, description, hidden });
      setOverride(list);
      applyOverrideToGlobals();
    }

    resetForm();
    render();
  }

  // Export productData.js (tùy chọn)
  function exportProductData() {
    const base = getBaseFromProductData();
    const current = getCurrentProducts();
    const currMap = new Map(current.map((p) => [String(p.id), p]));
    const merged = base.map((b) => {
      const cur = currMap.get(String(b.id));
      if (!cur) return b;
      return {
        ...b,
        name: cur.name ?? b.name,
        category: cur.category ?? b.category,
        img: cur.img ?? b.img,
        description: cur.description ?? b.description,
        hidden: cur.hidden ?? b.hidden,
      };
    });
    current.forEach((cur) => {
      if (!base.some((b) => String(b.id) === String(cur.id))) {
        merged.push({
          id: cur.id,
          name: cur.name || "",
          category: cur.category || "",
          price: null,
          oldPrice: null,
          img: cur.img || "",
          rating: 0,
          ratingCount: 0,
          badge: null,
          description: cur.description || "",
          images: cur.img ? [cur.img] : [],
          hidden: !!cur.hidden,
        });
      }
    });

    const header = `/**
 * productData.js (exported)
 * Generated at ${new Date().toISOString()}
 */\n\n`;
    const js = `${header}const productDataList = ${JSON.stringify(
      merged,
      null,
      2
    )};\n\nconst products = productDataList.map(data => new Product(data));\n`;
    const blob = new Blob([js], {
      type: "application/javascript;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "productData.js";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  }

  function init() {
    bindEls();
    populateCategorySelect();

    els.form?.addEventListener("submit", onSubmit);
    els.resetBtn?.addEventListener("click", resetForm);
    els.search?.addEventListener("input", render);
    els.filterCat?.addEventListener("change", render);
    els.filterStatus?.addEventListener("change", render);
    els.exportBtn?.addEventListener("click", exportProductData);

    render();
    updateProductCount();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
