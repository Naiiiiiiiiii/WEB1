// Admin 3: Quản lý danh mục qua backend (products.json)
// - GET/POST /api/categories, fallback từ /api/products nếu rỗng
// - Ẩn/Hiện danh mục, không cho xóa nếu còn sản phẩm thuộc danh mục
// - Auto-save + BroadcastChannel('products-sync')

import { AdminAPI } from "./admin-api.js";

(function () {
  let categories = [];
  let products = [];
  let bc = null;

  // Debounce helper
  function debounce(fn, delay = 800) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  const els = {
    search: null,
    status: null,
    tbody: null,
    form: null,
    id: null,
    code: null,
    name: null,
    desc: null,
    hidden: null,
    resetBtn: null,
    tokenInput: null,
  };

  function bindEls() {
    els.search = document.getElementById("categorySearch");
    els.status = document.getElementById("categoryStatusFilter");
    els.tbody = document.getElementById("categoriesTableBody");

    els.form = document.getElementById("categoryForm");
    els.id = document.getElementById("categoryId");
    els.code = document.getElementById("categoryCode");
    els.name = document.getElementById("categoryName");
    els.desc = document.getElementById("categoryDesc");
    els.hidden = document.getElementById("categoryHidden");
    els.resetBtn = document.getElementById("resetCategoryFormBtn");

    els.tokenInput = document.getElementById("adminToken");
  }

  function genId(i = 0) {
    const base = Date.now().toString(36).toUpperCase();
    return `C-${base}-${(Math.random() + i)
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;
  }

  function slugCode(name = "") {
    const base = String(name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
    return base || "CAT";
  }

  function deriveFromProducts(list = []) {
    const names = Array.from(
      new Set(list.map((p) => p.category).filter(Boolean))
    );
    const now = Date.now();
    return names.map((n, i) => ({
      id: genId(i),
      code: slugCode(n),
      name: n,
      desc: "",
      hidden: false,
      createdAt: now,
    }));
  }

  function filteredList() {
    const q = (els.search?.value || "").toLowerCase().trim();
    const st = els.status?.value || "all";
    return categories.filter((c) => {
      const okSearch =
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.code || "").toLowerCase().includes(q);
      const okStatus = st === "all" || (st === "hidden" ? c.hidden : !c.hidden);
      return okSearch && okStatus;
    });
  }

  async function saveAll() {
    const token = els.tokenInput ? els.tokenInput.value || "" : "";
    const safe = categories.map((c, i) => ({
      id: c.id || genId(i),
      code: c.code || slugCode(c.name || ""),
      name: c.name || "",
      desc: c.desc || "",
      hidden: !!c.hidden,
      createdAt: c.createdAt ?? Date.now(),
    }));
    try {
      await AdminAPI.saveCategories(safe, { token });
    } catch (e) {
      console.warn(
        "[admin-categories] saveCategories failed (có thể chưa có endpoint)",
        e?.message || e
      );
    }
    try {
      bc?.postMessage({
        type: "updated",
        at: Date.now(),
        source: "admin-categories",
      });
    } catch {}
  }
  const debouncedSave = debounce(saveAll, 800);

  function render() {
    const list = filteredList();
    els.tbody.innerHTML = list
      .map(
        (c) => `
        <tr data-id="${c.id}">
          <td>${c.code}</td>
          <td>${c.name}</td>
          <td>${
            c.hidden
              ? '<span class="low">Đang ẩn</span>'
              : '<span class="ok">Hiển thị</span>'
          }</td>
          <td class="actions">
            <button class="btn ghost btn-edit">Sửa</button>
            <button class="btn btn-toggle">${c.hidden ? "Bỏ ẩn" : "Ẩn"}</button>
            <button class="btn btn-delete">Xóa</button>
          </td>
        </tr>
      `
      )
      .join("");

    // Edit
    els.tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const c = categories.find((x) => x.id === id);
        if (!c) return;
        els.id.value = c.id;
        els.code.value = c.code || "";
        els.name.value = c.name || "";
        els.desc.value = c.desc || "";
        els.hidden.checked = !!c.hidden;
        els.code.focus();
      });
    });

    // Toggle hidden → auto-save (debounced)
    els.tbody.querySelectorAll(".btn-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const idx = categories.findIndex((x) => x.id === id);
        if (idx === -1) return;
        categories[idx].hidden = !categories[idx].hidden;
        render();
        debouncedSave();
      });
    });

    // Delete → auto-save (debounced, có ràng buộc)
    els.tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const cat = categories.find((x) => x.id === id);
        if (!cat) return;

        const hasProducts = products.some(
          (p) => String(p.category) === String(cat.name)
        );
        if (hasProducts) {
          alert(
            "Không thể xóa: vẫn còn sản phẩm thuộc danh mục này. Hãy ẩn danh mục hoặc chuyển danh mục cho sản phẩm trước."
          );
          return;
        }
        if (!confirm("Xác nhận xóa danh mục?")) return;
        categories = categories.filter((x) => x.id !== id);
        render();
        debouncedSave();
      });
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const id = (els.id.value || "").trim();
    const code = (els.code.value || "").trim();
    const name = (els.name.value || "").trim();
    const desc = (els.desc.value || "").trim();
    const hidden = !!els.hidden.checked;

    if (!code || !name) {
      alert("Vui lòng nhập đủ mã và tên danh mục.");
      return;
    }

    if (id) {
      const idx = categories.findIndex((x) => x.id === id);
      if (idx !== -1)
        categories[idx] = { ...categories[idx], code, name, desc, hidden };
    } else {
      if (
        categories.some(
          (x) => (x.code || "").toLowerCase() === code.toLowerCase()
        )
      ) {
        alert("Mã danh mục đã tồn tại.");
        return;
      }
      categories.push({
        id: genId(),
        code,
        name,
        desc,
        hidden,
        createdAt: Date.now(),
      });
    }

    resetForm();
    render();
    // Submit thì lưu ngay (không debounce) để phản hồi tức thời
    try {
      await saveAll();
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại: " + err.message);
    }
  }

  function resetForm() {
    els.id.value = "";
    els.code.value = "";
    els.name.value = "";
    els.desc.value = "";
    els.hidden.checked = false;
  }

  async function init() {
    bindEls();

    try {
      bc = new BroadcastChannel("products-sync");
    } catch {}

    // Load products trước (ràng buộc xóa + fallback)
    try {
      products = await AdminAPI.getProducts();
    } catch {
      products = [];
    }

    // Load categories; nếu rỗng thì derive từ products
    try {
      const cats = await AdminAPI.getCategories();
      categories =
        Array.isArray(cats) && cats.length
          ? cats
          : deriveFromProducts(products);
      if (!cats || !cats.length) {
        try {
          await saveAll();
        } catch {}
      }
    } catch {
      categories = deriveFromProducts(products);
      try {
        await saveAll();
      } catch {}
    }

    els.form?.addEventListener("submit", onSubmit);
    els.resetBtn?.addEventListener("click", resetForm);
    els.search?.addEventListener("input", render);
    els.status?.addEventListener("change", render);

    // Auto-save khi đang SỬA một danh mục: thay đổi trong form sẽ debounce save
    els.form?.addEventListener("input", () => {
      if (els.id.value) debouncedSave();
    });
    els.form?.addEventListener("change", () => {
      if (els.id.value) debouncedSave();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
