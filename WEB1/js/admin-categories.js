// Admin 3: Quản lý loại (danh mục) sản phẩm
// Lưu trữ: localStorage key 'admin_categories'
// Đảm bảo đồng bộ với phần sản phẩm qua window.AdminCatalog (global)

(function () {
  const CAT_KEY = "admin_categories";
  const PROD_KEY = "admin_products"; // để kiểm tra ràng buộc khi xóa danh mục

  // Seed mẫu nếu trống
  function seedIfEmpty() {
    const data = getCategories();
    if (data.length) return;
    const sample = [
      {
        id: genId(),
        code: "SPT",
        name: "Giày thể thao",
        desc: "Sneaker/Running",
        hidden: false,
        createdAt: Date.now(),
      },
      {
        id: genId(),
        code: "SCS",
        name: "Giày công sở",
        desc: "Formal/Boots",
        hidden: false,
        createdAt: Date.now(),
      },
      {
        id: genId(),
        code: "SCA",
        name: "Giày casual",
        desc: "Casual/Daily",
        hidden: false,
        createdAt: Date.now(),
      },
    ];
    saveCategories(sample);
  }

  function genId() {
    return "C" + Math.random().toString(36).slice(2, 9).toUpperCase();
  }

  function getCategories() {
    try {
      return JSON.parse(localStorage.getItem(CAT_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveCategories(list) {
    localStorage.setItem(CAT_KEY, JSON.stringify(list));
    notifyChange();
  }
  function getProducts() {
    try {
      return JSON.parse(localStorage.getItem(PROD_KEY) || "[]");
    } catch {
      return [];
    }
  }

  // Global service để phần sản phẩm dùng
  const listeners = [];
  function notifyChange() {
    listeners.forEach((fn) => fn());
  }
  window.AdminCatalog = {
    getCategories,
    onChange: (fn) => {
      if (typeof fn === "function") listeners.push(fn);
    },
  };

  // UI refs
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
  }

  function render() {
    const list = getCategories();
    const q = (els.search?.value || "").toLowerCase().trim();
    const st = els.status?.value || "all";

    const filtered = list.filter((c) => {
      const okSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q);
      const okStatus = st === "all" || (st === "hidden" ? c.hidden : !c.hidden);
      return okSearch && okStatus;
    });

    els.tbody.innerHTML = filtered
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

    els.tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const c = list.find((x) => x.id === id);
        if (!c) return;
        els.id.value = c.id;
        els.code.value = c.code;
        els.name.value = c.name;
        els.desc.value = c.desc || "";
        els.hidden.checked = !!c.hidden;
        els.code.focus();
      });
    });

    els.tbody.querySelectorAll(".btn-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const listAll = getCategories();
        const idx = listAll.findIndex((x) => x.id === id);
        if (idx === -1) return;
        listAll[idx].hidden = !listAll[idx].hidden;
        saveCategories(listAll);
        render();
      });
    });

    els.tbody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        // Ràng buộc: không xóa nếu có sản phẩm thuộc danh mục
        const hasProducts = getProducts().some(
          (p) => String(p.categoryId) === String(id)
        );
        if (hasProducts) {
          alert(
            "Không thể xóa: vẫn còn sản phẩm thuộc danh mục này. Hãy ẩn hoặc chuyển danh mục cho sản phẩm trước."
          );
          return;
        }
        if (!confirm("Xác nhận xóa danh mục?")) return;
        const listAll = getCategories().filter((x) => x.id !== id);
        saveCategories(listAll);
        if (els.id.value === id) resetForm();
        render();
      });
    });
  }

  function resetForm() {
    els.id.value = "";
    els.code.value = "";
    els.name.value = "";
    els.desc.value = "";
    els.hidden.checked = false;
  }

  function onSubmit(e) {
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

    const list = getCategories();
    if (id) {
      const idx = list.findIndex((x) => x.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], code, name, desc, hidden };
      }
      saveCategories(list);
    } else {
      // Tránh trùng mã
      if (list.some((x) => x.code.toLowerCase() === code.toLowerCase())) {
        alert("Mã danh mục đã tồn tại.");
        return;
      }
      list.push({
        id: genId(),
        code,
        name,
        desc,
        hidden,
        createdAt: Date.now(),
      });
      saveCategories(list);
    }
    resetForm();
    render();
  }

  function init() {
    bindEls();
    seedIfEmpty();
    els.form?.addEventListener("submit", onSubmit);
    els.resetBtn?.addEventListener("click", resetForm);
    els.search?.addEventListener("input", render);
    els.status?.addEventListener("change", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
