/// js/nhap.js
// Dùng productDataList (mày đã cung cấp) — nếu chưa có ở file khác,
// dán productDataList trước đoạn này hoặc import nó.

// 
// ---------- BEGIN productDataList  ----------
const ORDERS_KEY = "import";
const productDataList = [
  {
    id: 1,
    name: "Giày thể thao CA Match",
    category: "Giày thể thao",
    price: 2300000,
    oldPrice: 2400000,
    img: "./img/giaythethao_CAMatch.avif",
    rating: 5,
    ratingCount: 128,
    badge: "hot",
    description: "Giày thể thao CA Match với thiết kế hiện đại, đế cao su bền bỉ, chất liệu thoáng khí, phù hợp cho các hoạt động thể thao và dạo phố.",
    images: [
      "./img/giaythethao_CAMatch.avif",
      "./img/giaythethao_CAMatch.avif",
      "./img/giaythethao_CAMatch.avif"
    ]
  },
  {
    id: 2,
    name: "Giày thể thao Suede Classic Unisex",
    category: "Giày thể thao",
    price: 1840000,
    oldPrice: 2300000,
    img: "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
    rating: 4,
    ratingCount: 95,
    badge: "sale",
    description: "Mẫu giày Suede Classic mang phong cách retro, chất liệu da lộn cao cấp, dễ phối đồ, phù hợp cho cả nam và nữ.",
    images: [
      "./img/Giày-thể-thao-Suede-Classic-Unisex.avif",
      "./img/Giày-thể-thao-Suede-Classic-Unisex.avif"
    ]
  },
  {
    id: 3,
    name: "GIÀY DA CÔNG SỞ (DA THẬT) - GERMANO BELLESI - SẢN XUẤT THỦ CÔNG TẠI ITALY",
    category: "Giày công sở",
    price: 10990000,
    oldPrice: null,
    img: "./img/giaycongsoGERMANO.webp",
    rating: 5,
    ratingCount: 203,
    badge: "new",
    description: "Giày da công sở Germano Bellesi được sản xuất thủ công tại Ý, sử dụng da thật cao cấp, mang lại sự sang trọng và đẳng cấp cho phái mạnh.",
    images: [
      "./img/giaycongsoGERMANO.webp",
      "./img/giaycongsoGERMANO.webp"
    ]
  },
  {
    id: 4,
    name: "Giày Boots nam MATURE Chelsea Boots – Đen – Version 2025",
    category: "Giày công sở",
    price: 1399000,
    oldPrice: null,
    img: "./img/bootsnam.webp",
    rating: 4,
    ratingCount: 76,
    badge: null,
    description: "Chelsea Boots MATURE phiên bản 2025 với thiết kế tối giản, chất liệu da bền đẹp, dễ phối đồ, phù hợp cho phong cách lịch lãm và cá tính.",
    images: [
      "./img/bootsnam.webp",
      "./img/bootsnam.webp"
    ]
  },
  {
    id: 5,
    name: "Giày Sneaker nam DYNAMIC – Vàng bò – Version 2025",
    category: "Giày casual",
    price: 1399000,
    oldPrice: null,
    img: "./img/casual_Dynamic.webp",
    rating: 5,
    ratingCount: 156,
    badge: null,
    description: "Sneaker DYNAMIC phiên bản 2025 với màu vàng bò nổi bật, thiết kế trẻ trung, đế êm ái, mang lại sự thoải mái cho cả ngày dài.",
    images: [
      "./img/casual_Dynamic.webp",
      "./img/casual_Dynamic.webp"
    ]
  },
  {
    id: 6,
    name: "Giày nam Warrior 2025 phong cách trẻ trung",
    category: "Giày casual",
    price: 522500,
    oldPrice: 550000,
    img: "./img/casual_Warrior.png",
    rating: 4,
    ratingCount: 89,
    badge: "sale",
    description: "Giày Warrior 2025 với phong cách trẻ trung, giá cả hợp lý, chất liệu nhẹ và bền, phù hợp cho sinh viên và giới trẻ năng động.",
    images: [
      "./img/casual_Warrior.png",
      "./img/casual_Warrior.png"
    ]
  }
];
// ---------- END productDataList ----------

// Nếu mày muốn dùng Product class (tạo object có method), tao tạo 1 class đơn giản:
class Product {
  constructor(data) {
    // copy tất cả thuộc tính từ data vào object
    Object.assign(this, data);
  }
  // ví dụ method: formatPrice
  formatPrice() {
    return this.price.toLocaleString("vi-VN") + " đ";
  }
}

// Tạo mảng products từ productDataList (dùng class Product)
const products = productDataList.map(d => new Product(d));

// Danh sách phiếu nhập (lưu localStorage)
let danhSachPhieuNhap = JSON.parse(localStorage.getItem("phieuNhapList")) || [];

// Helper: tìm product theo id (id có thể là number hoặc string)
function findProductById(id) {
  return products.find(p => String(p.id) === String(id));
}

// ====== UI FUNCTIONS ======
function loadProductOptions() {
  const selects = document.querySelectorAll(".productId");
  selects.forEach(sel => {
    // reset options
    sel.innerHTML = `<option value="">-- Chọn Sản phẩm --</option>`;
    products.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (ID:${p.id})`;
      sel.appendChild(opt);
    });
  });
}

function addProductItem() {
  const list = document.getElementById("product-list");
  const div = document.createElement("div");
  div.className = "product-item";
  div.innerHTML = `
    <select class="productId" required onchange="updateProductDetails(this)">
      <option value="">-- Chọn Sản phẩm --</option>
    </select>
    <input type="number" class="giaNhap" placeholder="Giá nhập" min="0" required>
    <input type="number" class="soLuong" placeholder="Số lượng" min="1" required>
    <button type="button" class="btn-danger" onclick="removeProductItem(this)">Xóa</button>
  `;
  list.appendChild(div);
  loadProductOptions(); // fill the new select
}

function removeProductItem(btn) {
  btn.parentElement.remove();
}

function updateProductDetails(selectEl) {
  const pid = selectEl.value;
  const product = findProductById(pid);
  const giaInput = selectEl.parentElement.querySelector(".giaNhap");
  if (product) {
    giaInput.value = product.price;
  } else {
    giaInput.value = "";
  }
}

// validate a product-item element and return detail object or null
function readProductItem(itemEl) {
  const pid = itemEl.querySelector(".productId").value;
  const gia = parseFloat(itemEl.querySelector(".giaNhap").value);
  const sl = parseInt(itemEl.querySelector(".soLuong").value, 10);
  const product = findProductById(pid);
  if (!product || isNaN(gia) || isNaN(sl) || sl <= 0) return null;
  return {
    id: product.id,
    name: product.name,
    giaNhap: gia,
    soLuong: sl,
    img: product.img
  };
}

function saveNhap(status = "Draft") {
  const ngay = document.getElementById("ngayNhap").value;
  if (!ngay) return alert("Vui lòng chọn ngày nhập!");

  const items = Array.from(document.querySelectorAll(".product-item"));
  const chiTiet = items.map(readProductItem).filter(Boolean);
  if (chiTiet.length === 0) return alert("Phải có ít nhất 1 dòng sản phẩm hợp lệ!");

  const tongTien = chiTiet.reduce((s, it) => s + it.giaNhap * it.soLuong, 0);
  const ma = "PN" + String(Date.now()).slice(-6);

  const phieu = {
    id: ma,
    ngayNhap: ngay,
    trangThai: status,
    chiTiet,
    tongTien
  };

  danhSachPhieuNhap.unshift(phieu); // đưa lên đầu (mới nhất)
  localStorage.setItem("phieuNhapList", JSON.stringify(danhSachPhieuNhap));
  alert(`Đã lưu phiếu (${status})`);
  displayNhapList();
  clearForm();
}

function completeNhap() {
  saveNhap("Completed");
}

function displayNhapList() {
  const tbody = document.querySelector("#nhap-table tbody");
  tbody.innerHTML = "";
  const q = document.getElementById("searchQuery").value.toLowerCase();
  const filter = document.getElementById("filterStatus").value;

  danhSachPhieuNhap
    .filter(pn => {
      const matchSearch = pn.id.toLowerCase().includes(q) || pn.ngayNhap.includes(q);
      const matchStatus = filter === "all" || pn.trangThai === filter;
      return matchSearch && matchStatus;
    })
    .forEach(pn => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pn.id}</td>
        <td>${pn.ngayNhap}</td>
        <td>${pn.trangThai}</td>
        <td>${pn.tongTien.toLocaleString("vi-VN")} đ</td>
        <td>
          <button onclick="viewDetails('${pn.id}')">Xem</button>
          <button onclick="editPhieu('${pn.id}')">Sửa</button>
          <button onclick="deletePhieu('${pn.id}')">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function viewDetails(id) {
  const pn = danhSachPhieuNhap.find(p => p.id === id);
  if (!pn) return alert("Không tìm thấy phiếu");
  let msg = `Mã: ${pn.id}\nNgày: ${pn.ngayNhap}\nTrạng thái: ${pn.trangThai}\nTổng: ${pn.tongTien.toLocaleString("vi-VN")} đ\n\nChi tiết:\n`;
  pn.chiTiet.forEach(ct => {
    msg += `- ${ct.name} (ID:${ct.id}) : ${ct.soLuong} x ${ct.giaNhap.toLocaleString("vi-VN")} đ\n`;
  });
  alert(msg);
}

function deletePhieu(id) {
  if (!confirm("Xóa phiếu này?")) return;
  danhSachPhieuNhap = danhSachPhieuNhap.filter(p => p.id !== id);
  localStorage.setItem("phieuNhapList", JSON.stringify(danhSachPhieuNhap));
  displayNhapList();
}

// Sửa phiếu (chỉ nếu phiếu là Draft)
function editPhieu(id) {
  const pn = danhSachPhieuNhap.find(p => p.id === id);
  if (!pn) return alert("Không tìm thấy");
  if (pn.trangThai === "Completed") return alert("Phiếu đã hoàn thành, không thể sửa.");

  // fill form
  document.getElementById("ngayNhap").value = pn.ngayNhap;
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  pn.chiTiet.forEach(ct => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <select class="productId" onchange="updateProductDetails(this)">
        <option value="">-- Chọn Sản phẩm --</option>
      </select>
      <input type="number" class="giaNhap" placeholder="Giá nhập" min="0" required>
      <input type="number" class="soLuong" placeholder="Số lượng" min="1" required>
      <button type="button" class="btn-danger" onclick="removeProductItem(this)">Xóa</button>
    `;
    list.appendChild(div);
  });
  loadProductOptions(); // populate selects
  // set values
  const productRows = Array.from(document.querySelectorAll(".product-item"));
  productRows.forEach((row, idx) => {
    const sel = row.querySelector(".productId");
    sel.value = pn.chiTiet[idx].id;
    row.querySelector(".giaNhap").value = pn.chiTiet[idx].giaNhap;
    row.querySelector(".soLuong").value = pn.chiTiet[idx].soLuong;
  });

  // Remove the edited phieu from list so that saving will add updated one
  danhSachPhieuNhap = danhSachPhieuNhap.filter(p => p.id !== id);
  localStorage.setItem("phieuNhapList", JSON.stringify(danhSachPhieuNhap));
  displayNhapList();
}

function clearForm() {
  document.getElementById("ngayNhap").value = "";
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  addProductItem();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  // Populate first row options and table
 // đảm bảo có 1 dòng
  loadProductOptions();
  displayNhapList();
});
