// Admin 8: Quản lý tồn kho đọc từ productData.js hoặc localStorage 'products'
// Nếu cả hai không có dữ liệu, file sẽ seed dữ liệu mẫu (localStorage 'products')
// - Lấy sản phẩm từ productDataList (ưu tiên) hoặc products (nếu có) hoặc localStorage 'products'
// - Tính tồn theo initialStock + tổng nhập (imports) - tổng xuất từ orders (trừ đơn hủy)

const ORDERS_KEY_INV = "orders"; // Đơn hàng lưu trong localStorage để tính xuất
const PRODUCTS_LS_KEY = "products"; // key localStorage để seed/đọc nếu productDataList không tồn tại

// --- Seed mẫu nếu không có dữ liệu sản phẩm ---
function seedProductsIfEmpty() {
  // Nếu productDataList được nạp (productData.js present) thì không seed
  if (
    typeof productDataList !== "undefined" &&
    Array.isArray(productDataList) &&
    productDataList.length > 0
  ) {
    return;
  }

  // Nếu đã có products trong localStorage thì không seed
  try {
    const existing = JSON.parse(
      localStorage.getItem(PRODUCTS_LS_KEY) || "null"
    );
    if (Array.isArray(existing) && existing.length > 0) return;
  } catch (e) {
    // ignore parse error and proceed to seed
  }

  // Dữ liệu mẫu để seed (đảm bảo phù hợp với cấu trúc admin-inventory)
  const sampleProducts = [
    {
      id: 1,
      name: "Giày thể thao CA Match",
      category: "Giày thể thao",
      price: 2300000,
      costPrice: 1650000,
      initialStock: 25,
      lowStockThreshold: 5,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 30).toISOString(),
          qty: 10,
          note: "Nhập đợt 1",
        },
        {
          date: new Date(Date.now() - 86400e3 * 10).toISOString(),
          qty: 5,
          note: "Nhập bổ sung",
        },
      ],
    },
    {
      id: 2,
      name: "Giày thể thao Suede Classic Unisex",
      category: "Giày thể thao",
      price: 1840000,
      costPrice: 1250000,
      initialStock: 30,
      lowStockThreshold: 6,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 40).toISOString(),
          qty: 15,
          note: "Nhập đợt 1",
        },
        {
          date: new Date(Date.now() - 86400e3 * 18).toISOString(),
          qty: 10,
          note: "Nhập đợt 2",
        },
      ],
    },
    {
      id: 3,
      name: "GIÀY DA CÔNG SỞ - GERMANO BELLESI",
      category: "Giày công sở",
      price: 10990000,
      costPrice: 8200000,
      initialStock: 8,
      lowStockThreshold: 3,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 50).toISOString(),
          qty: 5,
          note: "Nhập đợt 1",
        },
        {
          date: new Date(Date.now() - 86400e3 * 20).toISOString(),
          qty: 3,
          note: "Nhập bổ sung",
        },
      ],
    },
    {
      id: 4,
      name: "Giày Boots nam MATURE Chelsea Boots",
      category: "Giày công sở",
      price: 1399000,
      costPrice: 980000,
      initialStock: 20,
      lowStockThreshold: 4,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 35).toISOString(),
          qty: 10,
          note: "Nhập đợt 1",
        },
      ],
    },
    {
      id: 5,
      name: "Giày Sneaker nam DYNAMIC",
      category: "Giày casual",
      price: 1399000,
      costPrice: 960000,
      initialStock: 28,
      lowStockThreshold: 6,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 26).toISOString(),
          qty: 12,
          note: "Nhập đợt 1",
        },
        {
          date: new Date(Date.now() - 86400e3 * 6).toISOString(),
          qty: 6,
          note: "Nhập bổ sung",
        },
      ],
    },
    {
      id: 6,
      name: "Giày nam Warrior 2025",
      category: "Giày casual",
      price: 522500,
      costPrice: 370000,
      initialStock: 40,
      lowStockThreshold: 8,
      imports: [
        {
          date: new Date(Date.now() - 86400e3 * 36).toISOString(),
          qty: 20,
          note: "Nhập đợt 1",
        },
        {
          date: new Date(Date.now() - 86400e3 * 14).toISOString(),
          qty: 10,
          note: "Nhập đợt 2",
        },
      ],
    },
  ];

  // Lưu mẫu vào localStorage để admin có thể đọc được khi productData.js không nạp
  try {
    localStorage.setItem(PRODUCTS_LS_KEY, JSON.stringify(sampleProducts));
    console.info(
      "[admin-inventory] Seeded products into localStorage key:",
      PRODUCTS_LS_KEY
    );
  } catch (e) {
    console.error(
      "[admin-inventory] Failed to seed products into localStorage",
      e
    );
  }
}

// --- Lấy danh sách sản phẩm cho inventory ---
function getInventoryProducts() {
  // Nếu productDataList (file productData.js) tồn tại và có dữ liệu => ưu tiên dùng nó
  if (
    typeof productDataList !== "undefined" &&
    Array.isArray(productDataList) &&
    productDataList.length > 0
  ) {
    return productDataList.map((x) => normalizeProduct(x));
  }

  // Nếu mảng products (khởi tạo bởi Product class) tồn tại => dùng nó
  if (
    typeof products !== "undefined" &&
    Array.isArray(products) &&
    products.length > 0
  ) {
    return products.map((x) => normalizeProduct(x));
  }

  // Nếu không có 2 nguồn trên, thử đọc từ localStorage 'products'
  try {
    const ls = JSON.parse(localStorage.getItem(PRODUCTS_LS_KEY) || "null");
    if (Array.isArray(ls) && ls.length > 0) {
      return ls.map((x) => normalizeProduct(x));
    }
  } catch (e) {
    console.warn(
      "[admin-inventory] Error parsing products from localStorage",
      e
    );
  }

  // Nếu vẫn không có gì, trả mảng rỗng (seed sẽ được thực hiện bởi initInventory trước khi gọi)
  return [];
}

// Chuẩn hóa đối tượng sản phẩm về cấu trúc mà admin-inventory cần
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
  };
}

// Đọc đơn hàng để trừ xuất (trừ các đơn có status === 'canceled')
function getOrdersForInventory() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY_INV) || "[]");
  } catch {
    return [];
  }
}

function toDateOnly(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// Tính tồn tại thời điểm asOfDate (nếu null -> tới hiện tại)
function calcStockAt(productsMap, productId, asOfDate) {
  const p = productsMap.get(String(productId));
  if (!p) return 0;
  const asOf = asOfDate ? toDateOnly(asOfDate) : null;
  let stock = Number(p.initialStock || 0);

  // Nhập
  (p.imports || []).forEach((im) => {
    const d = toDateOnly(im.date);
    if (!asOf || d <= asOf) stock += Number(im.qty || 0);
  });

  // Xuất theo đơn hàng (trừ đơn hủy)
  const orders = getOrdersForInventory();
  orders.forEach((o) => {
    if (o.status === "canceled") return;
    const d = toDateOnly(o.date);
    if (asOf && d > asOf) return;
    (o.items || []).forEach((it) => {
      if (String(it.productId) === String(productId)) {
        stock -= Number(it.qty || 0);
      }
    });
  });

  return stock;
}

function uniqueCategories(products) {
  return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
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
  if (asOf && !asOf.value) {
    asOf.value = new Date().toISOString().slice(0, 10);
  }
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

  const map = new Map(invProducts.map((p) => [String(p.id), p]));
  const tbody = document.querySelector("#inventoryTable tbody");
  if (!tbody) return;

  tbody.innerHTML = list
    .map((p) => {
      const stock = calcStockAt(
        map,
        String(p.id),
        asOf ? new Date(asOf) : null
      );
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
        </td>
      </tr>
    `;
    })
    .join("");

  tbody.querySelectorAll(".btn-mv").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      const id = tr?.dataset.id;
      if (id) openMovements(id, invProducts);
    });
  });
}

let currentMvProductId = null;

function openMovements(productId, invProducts) {
  currentMvProductId = productId;
  const p = invProducts.find((x) => String(x.id) === String(productId));
  if (!p) return;

  // Default: 30 ngày gần nhất
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

  // Số dư đầu kỳ
  const startDate = from ? new Date(from) : null;
  const map = new Map(invProducts.map((pp) => [String(pp.id), pp]));
  let balance = calcStockAt(
    map,
    String(p.id),
    startDate ? new Date(startDate.getTime() - 1) : null
  );

  const rows = [];
  rows.push({
    date: startDate ? startDate.toISOString() : new Date(0).toISOString(),
    type: "Số dư đầu kỳ",
    qty: 0,
    balance: balance,
    note: "",
  });

  // Gộp các phát sinh nhập–xuất trong khoảng
  const events = [];

  // Nhập
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

  // Xuất từ đơn hàng (trừ đơn hủy)
  const orders = getOrdersForInventory();
  orders.forEach((o) => {
    if (o.status === "canceled") return;
    const d = new Date(o.date);
    if ((from && d < from) || (to && d > to)) return;
    (o.items || []).forEach((it) => {
      if (String(it.productId) === String(p.id)) {
        events.push({
          date: d,
          type: "Xuất",
          qty: -Number(it.qty || 0),
          note: o.id,
        });
      }
    });
  });

  // Sắp xếp theo thời gian
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
  if (el) {
    el.textContent = `Số sản phẩm hiện có: ${invProducts.length}`;
  }
}

function initInventory() {
  // Seed mẫu nếu cần (chỉ seed vào localStorage nếu productData.js không nạp)
  seedProductsIfEmpty();

  const invProducts = getInventoryProducts();

  populateInvFilters(invProducts);
  applyInvFilters(invProducts);
  updateProductCount(invProducts);

  document
    .getElementById("invFilterApply")
    ?.addEventListener("click", () => applyInvFilters(invProducts));

  document.getElementById("invFilterReset")?.addEventListener("click", () => {
    const nameEl = document.getElementById("invFilterName");
    const catEl = document.getElementById("invFilterCategory");
    const dateEl = document.getElementById("invAsOfDate");
    if (nameEl) nameEl.value = "";
    if (catEl) catEl.value = "all";
    if (dateEl) dateEl.value = new Date().toISOString().slice(0, 10);
    applyInvFilters(invProducts);
  });

  document.getElementById("movementsClose")?.addEventListener("click", () => {
    document.getElementById("movementsPanel").style.display = "none";
    currentMvProductId = null;
  });
  document
    .getElementById("mvApply")
    ?.addEventListener("click", () => renderMovements(invProducts));
}

document.addEventListener("DOMContentLoaded", initInventory);
