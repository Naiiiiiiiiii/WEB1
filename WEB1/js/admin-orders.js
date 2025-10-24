// Admin 7: Quản lý đơn đặt hàng (lọc theo ngày & trạng thái, xem chi tiết, cập nhật trạng thái, phân trang)
const ORDERS_KEY = "orders";

// Seed dữ liệu mẫu nếu trống
function seedOrdersIfEmpty() {
  const exist = localStorage.getItem(ORDERS_KEY);
  if (exist) return;

  // Một ít dữ liệu mẫu; productId nên khớp với productData.js của bạn
  const sample = [
    {
      id: "ODR-240001",
      date: new Date().toISOString(),
      customerName: "Nguyễn Văn A",
      status: "new", // new | processed | delivered | canceled
      total: 1599000,
      paymentMethod: "COD",
      shippingAddress: "12 Nguyễn Trãi, Q.5, TP.HCM",
      items: [
        {
          productId: 1,
          name: "Giày thể thao CA Match",
          qty: 1,
          unitPrice: 899000,
        },
        {
          productId: 2,
          name: "Giày thể thao Suede Classic Unisex",
          qty: 1,
          unitPrice: 700000,
        },
      ],
    },
    {
      id: "ODR-240002",
      date: new Date(Date.now() - 86400e3 * 3).toISOString(),
      customerName: "Trần Thị B",
      status: "processed",
      total: 1299000,
      paymentMethod: "Chuyển khoản",
      shippingAddress: "45 Lê Lợi, Q.1, TP.HCM",
      items: [
        {
          productId: 2,
          name: "Giày thể thao Suede Classic Unisex",
          qty: 1,
          unitPrice: 700000,
        },
        {
          productId: 6,
          name: "Giày nam Warrior 2025 phong cách trẻ trung",
          qty: 2,
          unitPrice: 299500,
        },
      ],
    },
    {
      id: "ODR-240003",
      date: new Date(Date.now() - 86400e3 * 10).toISOString(),
      customerName: "Lê Minh C",
      status: "delivered",
      total: 899000,
      paymentMethod: "COD",
      shippingAddress: "99 Hai Bà Trưng, Q.3, TP.HCM",
      items: [
        {
          productId: 1,
          name: "Giày thể thao CA Match",
          qty: 1,
          unitPrice: 899000,
        },
      ],
    },
  ];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(sample));
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatMoney(vnd) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(vnd || 0);
  } catch {
    return `${vnd}₫`;
  }
}

function statusBadge(status) {
  const map = {
    new: { cls: "badge badge-new", text: "Mới đặt" },
    processed: { cls: "badge badge-processed", text: "Đã xử lý" },
    delivered: { cls: "badge badge-delivered", text: "Đã giao" },
    canceled: { cls: "badge badge-canceled", text: "Hủy" },
  };
  const s = map[status] || map["new"];
  return `<span class="${s.cls}">${s.text}</span>`;
}

function statusOptions(current) {
  const options = [
    { v: "new", t: "Mới đặt" },
    { v: "processed", t: "Đã xử lý" },
    { v: "delivered", t: "Đã giao" },
    { v: "canceled", t: "Hủy" },
  ];
  return options
    .map(
      (o) =>
        `<option value="${o.v}" ${o.v === current ? "selected" : ""}>${
          o.t
        }</option>`
    )
    .join("");
}

function applyOrderFilters(data) {
  const fromEl = document.getElementById("orderFilterFrom");
  const toEl = document.getElementById("orderFilterTo");
  const stEl = document.getElementById("orderFilterStatus");

  const from = fromEl?.value ? new Date(fromEl.value + "T00:00:00Z") : null;
  const to = toEl?.value ? new Date(toEl.value + "T23:59:59Z") : null;
  const st = stEl?.value || "all";

  return data
    .filter((o) => {
      const d = new Date(o.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (st !== "all" && o.status !== st) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

const ORDERS_PER_PAGE = 10;
let ordersState = { page: 1, filtered: [] };

function renderOrdersTable() {
  const tbody = document.querySelector("#ordersTable tbody");
  const pagEl = document.getElementById("ordersPagination");
  if (!tbody || !pagEl) return;

  const start = (ordersState.page - 1) * ORDERS_PER_PAGE;
  const pageData = ordersState.filtered.slice(start, start + ORDERS_PER_PAGE);

  tbody.innerHTML = pageData
    .map(
      (o) => `
    <tr data-id="${o.id}">
      <td class="nowrap">${o.id}</td>
      <td class="nowrap">${formatDate(o.date)}</td>
      <td>${o.customerName}</td>
      <td class="right">${formatMoney(o.total)}</td>
      <td>
        <div style="display:flex; gap:8px; align-items:center;">
          ${statusBadge(o.status)}
          <select class="order-status-select">
            ${statusOptions(o.status)}
          </select>
        </div>
      </td>
      <td class="nowrap actions">
        <button class="btn ghost btn-view">Xem</button>
        <button class="btn primary btn-save-status">Lưu</button>
      </td>
    </tr>
  `
    )
    .join("");

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(ordersState.filtered.length / ORDERS_PER_PAGE)
  );
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${
      i === ordersState.page ? "active" : ""
    }" data-page="${i}">${i}</button>`;
  }
  pagEl.innerHTML = html;

  // Events
  pagEl.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ordersState.page = parseInt(btn.dataset.page, 10);
      renderOrdersTable();
    });
  });

  tbody.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      const id = tr?.dataset.id;
      if (!id) return;
      const order = ordersState.filtered.find((x) => x.id === id);
      if (order) showOrderDetail(order);
    });
  });

  tbody.querySelectorAll(".btn-save-status").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      const id = tr?.dataset.id;
      const sel = tr?.querySelector(".order-status-select");
      if (!id || !sel) return;
      updateOrderStatus(id, sel.value);
    });
  });
}

function showOrderDetail(order) {
  const box = document.getElementById("orderDetailBox");
  const meta = document.getElementById("orderDetailMeta");
  const items = document.getElementById("orderDetailItems");
  const close = document.getElementById("orderDetailClose");
  if (!box || !meta || !items || !close) return;

  meta.innerHTML = `
    <div><b>Mã đơn:</b> ${order.id}</div>
    <div><b>Ngày đặt:</b> ${formatDate(order.date)}</div>
    <div><b>Khách hàng:</b> ${order.customerName}</div>
    <div><b>Trạng thái:</b> ${statusBadge(order.status)}</div>
    <div><b>Thanh toán:</b> ${order.paymentMethod || "-"}</div>
    <div><b>Địa chỉ giao:</b> ${order.shippingAddress || "-"}</div>
    <div><b>Tổng tiền:</b> ${formatMoney(order.total)}</div>
  `;

  items.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Mã SP</th>
          <th>Tên</th>
          <th class="right w-120">Đơn giá</th>
          <th class="right w-120">Số lượng</th>
          <th class="right w-120">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (it) => `
          <tr>
            <td>${it.productId}</td>
            <td>${it.name}</td>
            <td class="right">${formatMoney(it.unitPrice)}</td>
            <td class="right">${it.qty}</td>
            <td class="right">${formatMoney(it.unitPrice * it.qty)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  box.style.display = "block";
  close.onclick = () => {
    box.style.display = "none";
  };
}

function updateOrderStatus(id, newStatus) {
  const list = getOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return;
  list[idx].status = newStatus;
  saveOrders(list);

  // Cập nhật danh sách đang hiển thị
  ordersState.filtered = applyOrderFilters(getOrders());
  renderOrdersTable();
  // Cập nhật tổng số đơn
  updateOrderCount();
}

function updateOrderCount() {
  const el = document.getElementById("countOrders");
  if (el) {
    const n = getOrders().length;
    el.textContent = `Số đơn đặt hàng hiện có: ${n}`;
  }
}

/* ============================================================
   CART -> ORDERS INTEGRATION (TÙY CHỌN, ĐANG COMMENT)
   Khi phần giỏ hàng/checkout hoàn thiện, bỏ comment để dùng.

   Mặc định giỏ hàng đang được lưu trong localStorage với key 'cart_shoestore'
   và mỗi item có cấu trúc tối thiểu: { id, name, price, qty }

   Cách dùng mẫu:
   1) Bỏ comment toàn bộ hàm placeOrderFromCart bên dưới.
   2) Từ trang checkout, sau khi người dùng xác nhận đặt hàng, gọi:
      placeOrderFromCart({
        name: 'Tên KH',
        address: 'Địa chỉ giao',
        payment: 'COD' // hoặc 'Chuyển khoản', 'Online'
      });
   3) Hàm sẽ:
      - Đọc cart_shoestore
      - Tạo object order và push vào localStorage 'orders'
      - Xóa giỏ (nếu muốn)
      - Có thể dispatch sự kiện để admin tự reload (tùy chọn)
================================================================= */

// function placeOrderFromCart(customer) {
//   try {
//     const cart = JSON.parse(localStorage.getItem('cart_shoestore') || '[]');
//     if (!Array.isArray(cart) || cart.length === 0) {
//       alert('Giỏ hàng trống!');
//       return;
//     }
//
//     // Tính tổng tiền
//     const total = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
//
//     // Tạo mã đơn
//     const id = 'ODR-' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
//
//     const order = {
//       id,
//       date: new Date().toISOString(),
//       customerName: customer?.name || 'Khách hàng',
//       shippingAddress: customer?.address || '',
//       paymentMethod: customer?.payment || 'COD',
//       status: 'new',
//       total,
//       items: cart.map(i => ({
//         productId: i.id,                // cần khớp ID với productData.js
//         name: i.name,
//         qty: Number(i.qty) || 1,
//         unitPrice: Number(i.price) || 0
//       }))
//     };
//
//     const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
//     orders.push(order);
//     localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
//
//     // Xóa giỏ nếu muốn
//     localStorage.removeItem('cart_shoestore');
//
//     // Thông báo/điều hướng tùy ý
//     // alert('Đặt hàng thành công! Mã đơn: ' + id);
//
//     // (Tùy chọn) Gửi sự kiện để tab admin (nếu đang mở) có thể cập nhật theo thời gian thực
//     // window.dispatchEvent(new StorageEvent('storage', { key: ORDERS_KEY, newValue: JSON.stringify(orders) }));
//   } catch (e) {
//     console.error('placeOrderFromCart error:', e);
//   }
// }
/* ============================ HẾT PHẦN COMMENT ============================ */

function initOrders() {
  seedOrdersIfEmpty();

  document.getElementById("orderFilterApply")?.addEventListener("click", () => {
    ordersState.page = 1;
    ordersState.filtered = applyOrderFilters(getOrders());
    renderOrdersTable();
  });

  document.getElementById("orderFilterReset")?.addEventListener("click", () => {
    document.getElementById("orderFilterFrom").value = "";
    document.getElementById("orderFilterTo").value = "";
    document.getElementById("orderFilterStatus").value = "all";
    ordersState.page = 1;
    ordersState.filtered = applyOrderFilters(getOrders());
    renderOrdersTable();
  });

  // Khởi tạo lần đầu
  ordersState.filtered = applyOrderFilters(getOrders());
  renderOrdersTable();
  updateOrderCount();

  // Đóng chi tiết nếu chuyển section
  document.getElementById("orderDetailClose")?.addEventListener("click", () => {
    const box = document.getElementById("orderDetailBox");
    if (box) box.style.display = "none";
  });

  // (Tùy chọn) Nếu orders thay đổi ở tab khác, có thể tự refresh
  window.addEventListener("storage", (ev) => {
    if (ev.key === ORDERS_KEY) {
      ordersState.filtered = applyOrderFilters(getOrders());
      renderOrdersTable();
      updateOrderCount();
    }
  });
}

document.addEventListener("DOMContentLoaded", initOrders);
