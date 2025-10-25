document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // 🔹 CÁC BIẾN CHÍNH
  // =========================
  const trangDangNhap = document.getElementById('loginPage');
  const trangQuanTri = document.getElementById('adminPanel');
  const formDangNhap = document.getElementById('formDangNhap');
  const menuLinks = document.querySelectorAll('.nav-menu a');
  const cacSection = document.querySelectorAll('.main-content section');
  const nutDangXuat = document.querySelector('.logout');

  // =========================
  // 🔹 HÀM XỬ LÝ CHUYỂN TRANG
  // =========================
  function hienTrangDangNhap() {
    trangDangNhap.style.display = 'flex';
    trangQuanTri.style.display = 'none';
    window.location.hash = "";
  }

  function hienTrangQuanTri() {
    trangDangNhap.style.display = 'none';
    trangQuanTri.style.display = 'block';
    chuyenSection('#index');
  }

  function kiemTraDangNhap() {
    const daDangNhap = localStorage.getItem('isLoggedIn');
    if (daDangNhap === 'true') {
      hienTrangQuanTri();
    } else {
      hienTrangDangNhap();
    }
  }

  function chuyenSection(id) {
    cacSection.forEach(sec => sec.classList.remove('active'));
    const secChon = document.querySelector(id);
    if (secChon) secChon.classList.add('active');

    menuLinks.forEach(link =>
      link.classList.toggle('active', link.getAttribute('href') === id)
    );
  }

  // =========================
  // 🔹 XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT
  // =========================
  if (formDangNhap) {
    formDangNhap.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();

      if (user === 'admin' && pass === 'Admin123') {
        localStorage.setItem('isLoggedIn', 'true');
        alert('Đăng nhập thành công');
        hienTrangQuanTri();
      } else {
        alert('Sai tài khoản hoặc mật khẩu!');
      }
    });
  }

  if (nutDangXuat) {
    nutDangXuat.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Bạn có muốn đăng xuất?')) {
        localStorage.removeItem('isLoggedIn');
        alert('Đăng xuất thành công');
        hienTrangDangNhap();
      }
    });
  }

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      chuyenSection(link.getAttribute('href'));
    });
  });

  kiemTraDangNhap();

  // =========================
  // 🔹 PHẦN QUẢN LÝ NGƯỜI DÙNG
  // =========================
  const danhSachNguoiDung = [
    { hoten: "Nguyễn Văn A", username: "nva", email: "nva@gmail.com" },
    { hoten: "Trần Thị B", username: "ttb", email: "ttb@gmail.com" },
    { hoten: "Lê Văn C", username: "lvc", email: "lvc@gmail.com" }
  ];

  function hienThiBangNguoiDung() {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    danhSachNguoiDung.forEach((nguoi, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${nguoi.hoten}</td>
        <td>${nguoi.username}</td>
        <td>${nguoi.email}</td>
        <td>
          <button class="btn-reset" data-index="${i}">🔁 Reset</button>
          <button class="btn-delete" data-index="${i}">🗑 Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-reset").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        alert(`Đã reset mật khẩu cho: ${danhSachNguoiDung[index].username}`);
      });
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (confirm(`Xóa người dùng "${danhSachNguoiDung[index].username}"?`)) {
          danhSachNguoiDung.splice(index, 1);
          hienThiBangNguoiDung();
        }
      });
    });
  }
  hienThiBangNguoiDung();

  // =========================
  // 🔹 PHẦN QUẢN LÝ SẢN PHẨM
  // =========================
  const danhSachSanPham = [
    { ten: "Nước suối", gia: 5000, loai: "Giải khát" },
    { ten: "Cà phê lon", gia: 15000, loai: "Giải khát" },
    { ten: "Bánh snack", gia: 10000, loai: "Ăn vặt" }
  ];

  function hienThiSanPham() {
    const tbody = document.getElementById("productTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";
    danhSachSanPham.forEach((sp, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sp.ten}</td>
        <td>${sp.gia.toLocaleString()} đ</td>
        <td>${sp.loai}</td>
        <td><button class="btn-xoa" data-index="${index}">Xóa</button></td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-xoa").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        if (confirm(`Bạn có muốn xóa sản phẩm "${danhSachSanPham[i].ten}" không?`)) {
          danhSachSanPham.splice(i, 1);
          hienThiSanPham();
        }
      });
    });
  }

  const btnThemSanPham = document.getElementById("btnThemSanPham");
  if (btnThemSanPham) {
    btnThemSanPham.addEventListener("click", () => {
      const ten = document.getElementById("tenSanPham").value.trim();
      const gia = document.getElementById("giaSanPham").value.trim();
      const loai = document.getElementById("loaiSanPham").value.trim();

      if (!ten || !gia || !loai) {
        alert("Vui lòng nhập đầy đủ thông tin sản phẩm!");
        return;
      }

      danhSachSanPham.push({ ten, gia: parseInt(gia), loai });
      hienThiSanPham();

      document.getElementById("tenSanPham").value = "";
      document.getElementById("giaSanPham").value = "";
      document.getElementById("loaiSanPham").value = "";
    });
  }
  hienThiSanPham();

  // =========================
  // 🔹 PHẦN QUẢN LÝ ĐƠN HÀNG
  // =========================
  const danhSachDonHang = [
    { ma: "DH001", khach: "Nguyễn Văn A", tong: 50000, trangThai: "new" },
    { ma: "DH002", khach: "Trần Thị B", tong: 120000, trangThai: "processed" },
    { ma: "DH003", khach: "Phạm Văn C", tong: 75000, trangThai: "delivered" },
  ];

  function hienThiDonHang() {
    const tbody = document.querySelector("#ordersTable tbody");
    const loc = document.getElementById("orderFilterStatus");
    if (!tbody || !loc) return;

    tbody.innerHTML = "";

    const donLoc = loc.value === "all"
      ? danhSachDonHang
      : danhSachDonHang.filter(dh => dh.trangThai === loc.value);

    donLoc.forEach((dh, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dh.ma}</td>
        <td>${dh.khach}</td>
        <td class="right">${dh.tong.toLocaleString()} đ</td>
        <td>
          <select class="chonTrangThai" data-index="${i}">
            <option value="new" ${dh.trangThai === "new" ? "selected" : ""}>Mới đặt</option>
            <option value="processed" ${dh.trangThai === "processed" ? "selected" : ""}>Đã xử lý</option>
            <option value="delivered" ${dh.trangThai === "delivered" ? "selected" : ""}>Đã giao</option>
            <option value="canceled" ${dh.trangThai === "canceled" ? "selected" : ""}>Hủy</option>
          </select>
        </td>
        <td><button class="btn-xoa-don" data-index="${i}">Xóa</button></td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".chonTrangThai").forEach(select => {
      select.addEventListener("change", (e) => {
        const i = e.target.dataset.index;
        danhSachDonHang[i].trangThai = e.target.value;
        alert(`Đã cập nhật trạng thái cho đơn ${danhSachDonHang[i].ma}`);
      });
    });

    document.querySelectorAll(".btn-xoa-don").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        if (confirm(`Bạn có muốn xóa đơn ${danhSachDonHang[i].ma} không?`)) {
          danhSachDonHang.splice(i, 1);
          hienThiDonHang();
        }
      });
    });
  }

  const trangThaiLoc = document.getElementById("orderFilterStatus");
  if (trangThaiLoc) trangThaiLoc.addEventListener("change", hienThiDonHang);

  hienThiDonHang();
});
