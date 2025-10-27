import { AdminAPI } from "./admin-api.js";

// Admin 4: Quản lý sản phẩm qua API
(function () {
  let products = []; // danh sách hiện hành (từ API)

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
    saveAllBtn: null,
    tokenInput: null,
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

    // Bạn có thể thêm một input cho token (DEV) hoặc lấy token từ session admin
    els.tokenInput = document.getElementById("adminToken"); // optional
  }

  function uniqueCategories() {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  }

  function populateCategorySelects() {
    const cats = uniqueCategories();
    if (els.filterCat) {
      const keep = els.filterCat.value || "all";
      els.filterCat.innerHTML =
        `<option value="all">Tất cả</option>` +
        cats.map((c) => `<option value="${c}">${c}</option>`).join("");
      els.filterCat.value = keep;
    }
    if (els.category) {
      const keep = els.category.value || "";
      els.category.innerHTML = cats
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("");
      if (!els.category.innerHTML) {
        // nếu chưa có danh mục nào, cho phép nhập thủ công bằng text (tùy chọn)
        els.category.outerHTML = `<input type="text" id="productCategory" placeholder="Nhập danh mục">`;
        els.category = document.getElementById("productCategory");
        els.category.value = keep;
      } else if (keep) {
        els.category.value = keep;
      }
    }
  }

  function renderTable() {
    const q = (els.search?.value || "").toLowerCase().trim();
    const cat = els.filterCat?.value || "all";
    const st = els.filterStatus?.value || "all";

    const filtered = products.filter((p) => {
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
        const p = products.find((x) => String(x.id) === String(id));
        if (!p) return;
        els.idHidden.value = p.id;
        els.code.value = p.id;
        els.code.setAttribute("disabled", "disabled");
        els.name.value = p.name || "";
        if (els.category.tagName === "SELECT")
          els.category.value = p.category || "";
        else els.category.value = p.category || "";
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
        const idx = products.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return;
        products[idx].hidden = !products[idx].hidden;
        renderTable();
      });
    });

    els.tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        if (!confirm("Xác nhận xóa sản phẩm?")) return;
        products = products.filter((x) => String(x.id) !== String(id));
        if (els.idHidden.value && String(els.idHidden.value) === String(id))
          resetForm();
        renderTable();
      });
    });
  }

  function resetForm() {
    els.idHidden.value = "";
    els.code.value = "";
    els.name.value = "";
    if (els.category.tagName === "SELECT" && els.category.options.length)
      els.category.value = els.category.options[0].value;
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

    if (oldId) {
      const idx = products.findIndex((x) => String(x.id) === String(oldId));
      if (idx === -1) {
        alert("Không tìm thấy sản phẩm để cập nhật.");
        return;
      }
      products[idx] = {
        ...products[idx],
        name,
        category,
        img,
        description,
        hidden,
      };
    } else {
      if (products.some((x) => String(x.id) === String(newId))) {
        alert("Mã sản phẩm (id) đã tồn tại.");
        return;
      }
      products.push({ id: newId, name, category, img, description, hidden });
      populateCategorySelects();
    }

    resetForm();
    renderTable();
  }

  async function saveAllToServer() {
    try {
      const token = els.tokenInput ? els.tokenInput.value || "" : "";
      await AdminAPI.saveProducts(products, { token });
      alert("Đã lưu lên server!");
    } catch (e) {
      console.error(e);
      alert("Lưu thất bại: " + e.message);
    }
  }

  async function init() {
    bindEls();

    // Nút lưu toàn bộ (bạn có thể thêm 1 nút trong UI, hoặc tự lưu khi submit)
    // Nếu chưa có nút, bạn có thể gọi saveAllToServer() ngay sau onSubmit hoặc khi ấn toggle/xóa.
    const saveBtn = document.getElementById("saveProductsToServer");
    if (saveBtn) saveBtn.addEventListener("click", saveAllToServer);

    els.form?.addEventListener("submit", onSubmit);
    els.resetBtn?.addEventListener("click", resetForm);
    els.search?.addEventListener("input", renderTable);
    els.filterCat?.addEventListener("change", renderTable);
    els.filterStatus?.addEventListener("change", renderTable);

    // Tải dữ liệu từ API
    try {
      products = await AdminAPI.getProducts();
    } catch (e) {
      console.error("Get products error", e);
      products = [];
    }
    populateCategorySelects();
    renderTable();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
