import { AdminAPI } from "./admin-api.js";

const ORDERS_KEY_INV = "orders";

(function () {
  let products = [];
  let bc = null;
  let tokenInput = null;

  function toDateOnly(d) {
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }
  function getOrdersForInventory() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY_INV) || "[]");
    } catch {
      return [];
    }
  }

  function normalizeProduct(x) {
    return {
      id: x.id,
      name: x.name,
      category: x.category || "",
      price: Number(x.price || 0),
      costPrice: x.costPrice ?? null,
      initialStock: Number(x.initialStock ?? 0),
      lowStockThreshold: Number(x.lowStockThreshold ?? 0),
      imports: Array.isArray(x.imports)
        ? x.imports.map((im) => ({
            date: im.date,
            qty: Number(im.qty || 0),
            note: im.note || "",
          }))
        : [],
      oldPrice: x.oldPrice ?? null,
      img: x.img || "",
      description: x.description || "",
      rating: x.rating || 0,
      ratingCount: x.ratingCount || 0,
      badge: x.badge || null,
      hidden: !!x.hidden,
      images: Array.isArray(x.images) ? x.images : x.img ? [x.img] : [],
    };
  }

  function calcStockAt(p, asOfDate) {
    const asOf = asOfDate ? toDateOnly(asOfDate) : null;
    let stock = Number(p.initialStock || 0);
    (p.imports || []).forEach((im) => {
      const d = toDateOnly(im.date);
      if (!asOf || d <= asOf) stock += Number(im.qty || 0);
    });
    const orders = getOrdersForInventory();
    orders.forEach((o) => {
      if (o.status === "canceled") return;
      const d = toDateOnly(o.date);
      if (asOf && d > asOf) return;
      (o.items || []).forEach((it) => {
        if (String(it.productId) === String(p.id)) stock -= Number(it.qty || 0);
      });
    });
    return stock;
  }

  function uniqueCategories(list) {
    return Array.from(new Set(list.map((p) => p.category).filter(Boolean)));
  }

  async function saveAllProducts() {
    const token = tokenInput ? tokenInput.value || "" : "";
    await AdminAPI.saveProducts(products, { token });
    try {
      bc?.postMessage({
        type: "updated",
        at: Date.now(),
        source: "admin-inventory",
      });
    } catch {}
  }

  function populateInvFilters(invProducts) {
    const catEl = document.getElementById("invFilterCategory");
    if (catEl) {
      const cats = uniqueCategories(invProducts);
      catEl.innerHTML =
        `<option value="all">Tất cả</option>` +
        cats.map((c) => `<option value="${c}">${c}</option>`).join("");
    }
    const asOf = document.getElementById("invAsOfDate");
    if (asOf && !asOf.value) asOf.value = new Date().toISOString().slice(0, 10);
  }

  function applyInvFilters(invProducts) {
    const nameQ = (document.getElementById("invFilterName")?.value || "")
      .toLowerCase()
      .trim();
    const cat = document.getElementById("invFilterCategory")?.value || "all";
    const asOf = document.getElementById("invAsOfDate")?.value || "";

    const list = invProducts
      .filter((p) => cat === "all" || p.category === cat)
      .filter((p) => !nameQ || (p.name || "").toLowerCase().includes(nameQ));

    const tbody = document.querySelector("#inventoryTable tbody");
    if (!tbody) return;

    tbody.innerHTML = list
      .map((p) => {
        const stock = calcStockAt(p, asOf ? new Date(asOf) : null);
        const low = p.lowStockThreshold || 0;
        const statusHtml =
          stock <= low
            ? `<span class="low">Sắp hết hàng</span>`
            : `<span class="ok">Đủ hàng</span>`;
        return `
        <tr data-id="${p.id}">
          <td class="nowrap">${p.id}</td>
          <td>${p.name}</td>
          <td class="nowrap">${p.category || "-"}</td>
          <td class="right nowrap">${stock}</td>
          <td class="right nowrap">${low}</td>
          <td>${statusHtml}</td>
          <td class="nowrap">
            <button class="btn ghost btn-mv">Xem lịch sử</button>
            <button class="btn btn-edit-inv">Sửa tồn</button>
            <button class="btn btn-add-import">Thêm nhập</button>
          </td>
        </tr>
      `;
      })
      .join("");

    tbody.querySelectorAll(".btn-mv").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        if (id) openMovements(String(id), invProducts);
      });
    });

    tbody.querySelectorAll(".btn-edit-inv").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const idx = products.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return;
        const p = products[idx];

        const cost = prompt(
          "Giá vốn (costPrice):",
          p.costPrice != null ? String(p.costPrice) : ""
        );
        if (cost === null) return;
        const init = prompt(
          "Tồn đầu kỳ (initialStock):",
          String(p.initialStock || 0)
        );
        if (init === null) return;
        const low = prompt(
          "Ngưỡng cảnh báo (lowStockThreshold):",
          String(p.lowStockThreshold || 0)
        );
        if (low === null) return;

        p.costPrice = cost === "" ? null : Number(cost);
        p.initialStock = Number(init || 0);
        p.lowStockThreshold = Number(low || 0);

        await saveAllProducts();
        applyInvFilters(products.map(normalizeProduct));
      });
    });

    tbody.querySelectorAll(".btn-add-import").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const tr = e.target.closest("tr");
        const id = tr?.dataset.id;
        const idx = products.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return;
        const p = products[idx];

        const qtyStr = prompt("Số lượng nhập (qty):", "1");
        if (qtyStr === null) return;
        const qty = Number(qtyStr || 0);
        if (!Number.isFinite(qty) || qty <= 0) {
          alert("Số lượng không hợp lệ.");
          return;
        }
        const note = prompt("Ghi chú:", "") || "";
        const im = { date: new Date().toISOString(), qty, note };
        if (!Array.isArray(p.imports)) p.imports = [];
        p.imports.push(im);

        await saveAllProducts();
        applyInvFilters(products.map(normalizeProduct));
      });
    });
  }

  let currentMvProductId = null;
  function openMovements(productId, invProducts) {
    currentMvProductId = productId;
    const p = invProducts.find((x) => String(x.id) === String(productId));
    if (!p) return;

    const to = new Date();
    const from = new Date(Date.now() - 86400e3 * 30);
    const mvFrom = document.getElementById("mvFrom");
    const mvTo = document.getElementById("mvTo");
    if (mvFrom) mvFrom.value = from.toISOString().slice(0, 10);
    if (mvTo) mvTo.value = to.toISOString().slice(0, 10);

    document.getElementById("movementsMeta").innerHTML = `
      <div><b>Mã SP:</b> ${p.id}</div>
      <div><b>Tên:</b> ${p.name}</div>
      <div><b>Loại:</b> ${p.category || "-"}</div>
    `;
    document.getElementById("movementsPanel").style.display = "block";
    renderMovements(invProducts);
  }

  function renderMovements(invProducts) {
    const p = invProducts.find(
      (x) => String(x.id) === String(currentMvProductId)
    );
    if (!p) return;

    const mvFrom = document.getElementById("mvFrom")?.value;
    const mvTo = document.getElementById("mvTo")?.value;
    const from = mvFrom ? new Date(mvFrom + "T00:00:00Z") : null;
    const to = mvTo ? new Date(mvTo + "T23:59:59Z") : null;

    let balance = calcStockAt(p, from ? new Date(from.getTime() - 1) : null);
    const rows = [
      {
        date: from ? from.toISOString() : new Date(0).toISOString(),
        type: "Số dư đầu kỳ",
        qty: 0,
        balance,
        note: "",
      },
    ];

    const events = [];
    (p.imports || []).forEach((im) => {
      const d = new Date(im.date);
      if ((from && d < from) || (to && d > to)) return;
      events.push({
        date: d,
        type: "Nhập",
        qty: Number(im.qty || 0),
        note: im.note || "",
      });
    });

    const orders = (function () {
      try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY_INV) || "[]");
      } catch {
        return [];
      }
    })();
    orders.forEach((o) => {
      if (o.status === "canceled") return;
      const d = new Date(o.date);
      if ((from && d < from) || (to && d > to)) return;
      (o.items || []).forEach((it) => {
        if (String(it.productId) === String(p.id))
          events.push({
            date: d,
            type: "Xuất",
            qty: -Number(it.qty || 0),
            note: o.id,
          });
      });
    });

    events.sort((a, b) => a.date - b.date);
    events.forEach((ev) => {
      balance += ev.qty;
      rows.push({
        date: ev.date.toISOString(),
        type: ev.type,
        qty: ev.qty,
        balance,
        note: ev.note || "",
      });
    });

    const tbody = document.querySelector("#movementsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td class="nowrap">${r.date.slice(0, 10)}</td>
        <td>${r.type}</td>
        <td class="right">${r.qty}</td>
        <td class="right">${r.balance}</td>
        <td>${r.note || ""}</td>
      </tr>
    `
      )
      .join("");
  }

  function updateProductCount(invProducts) {
    const el = document.getElementById("countProducts");
    if (el) el.textContent = `Số sản phẩm hiện có: ${invProducts.length}`;
  }

  async function init() {
    try {
      bc = new BroadcastChannel("products-sync");
    } catch {}
    tokenInput = document.getElementById("adminToken");

    try {
      const list = await AdminAPI.getProducts();
      products = list.map((x) => normalizeProduct(x));
    } catch (e) {
      console.error("Get products error", e);
      products = [];
    }

    const invProducts = products.map((x) => normalizeProduct(x));
    populateInvFilters(invProducts);
    applyInvFilters(invProducts);
    updateProductCount(invProducts);

    document
      .getElementById("invFilterApply")
      ?.addEventListener("click", () => applyInvFilters(products));
    document.getElementById("invFilterReset")?.addEventListener("click", () => {
      const nameEl = document.getElementById("invFilterName");
      const catEl = document.getElementById("invFilterCategory");
      const dateEl = document.getElementById("invAsOfDate");
      if (nameEl) nameEl.value = "";
      if (catEl) catEl.value = "all";
      if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
      applyInvFilters(products);
    });

    document.getElementById("movementsClose")?.addEventListener("click", () => {
      document.getElementById("movementsPanel").style.display = "none";
    });
    document
      .getElementById("mvApply")
      ?.addEventListener("click", () => renderMovements(products));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
