/// Dữ liệu mẫu
let danhSachLoaiSanPham = JSON.parse(localStorage.getItem("loaiSanPham")) || [
    { ma: "L001", ten: "Giày thể thao", loiNhuan: 20 },
    { ma: "L002", ten: "Giày công sở", loiNhuan: 25 },
    { ma: "L003", ten: "Giày casual", loiNhuan: 15 }
];

let danhSachSanPham = JSON.parse(localStorage.getItem("sanPham")) || [
    { 
        ma: "SP001", 
        maLoai: "L001", 
        ten: "Giày thể thao CA Match", 
        giaVon: 1916667, 
        loiNhuan: 20,
        img: "./img/giaythethao_CAMatch.avif"
    },
    { 
        ma: "SP002", 
        maLoai: "L001", 
        ten: "Giày thể thao Suede Classic Unisex", 
        giaVon: 1533333, 
        loiNhuan: 20,
        img: "./img/Giày-thể-thao-Suede-Classic-Unisex.avif"
    },
    { 
        ma: "SP003", 
        maLoai: "L002", 
        ten: "GIÀY DA CÔNG SỞ (DA THẬT) - GERMANO BELLESI", 
        giaVon: 8792000, 
        loiNhuan: 25,
        img: "./img/giaycongsoGERMANO.webp"
    },
    { 
        ma: "SP004", 
        maLoai: "L002", 
        ten: "Giày Boots nam MATURE Chelsea Boots – Đen – Version 2025", 
        giaVon: 1119200, 
        loiNhuan: 25,
        img: "./img/bootsnam.webp"
    },
    { 
        ma: "SP005", 
        maLoai: "L003", 
        ten: "Giày Sneaker nam DYNAMIC – Vàng bò – Version 2025", 
        giaVon: 1216522, 
        loiNhuan: 15,
        img: "./img/casual_Dynamic.webp"
    },
    { 
        ma: "SP006", 
        maLoai: "L003", 
        ten: "Giày nam Warrior 2025 phong cách trẻ trung", 
        giaVon: 454348, 
        loiNhuan: 15,
        img: "./img/casual_Warrior.png"
    }
];

// Hàm lưu dữ liệu
function luuDuLieu() {
    localStorage.setItem("loaiSanPham", JSON.stringify(danhSachLoaiSanPham));
    localStorage.setItem("sanPham", JSON.stringify(danhSachSanPham));
}

// Hàm tính giá bán
function tinhGiaBan(giaVon, phanTramLoiNhuan) {
    return Math.round(giaVon * (1 + phanTramLoiNhuan / 100));
}

// Hàm tính giá vốn từ giá bán
function tinhGiaVon(giaBan, phanTramLoiNhuan) {
    return Math.round(giaBan / (1 + phanTramLoiNhuan / 100));
}

// Hiển thị loại sản phẩm
function hienThiLoaiSanPham() {
    const tbody = document.querySelector("#bangLoaiSanPham tbody");
    tbody.innerHTML = "";

    danhSachLoaiSanPham.forEach((loai, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${loai.ma}</td>
            <td>${loai.ten}</td>
            <td>
                <input type="number" value="${loai.loiNhuan}" 
                       onchange="capNhatLoiNhuanLoai(${index}, this.value)" 
                       step="0.1" style="width: 80px">
            </td>
            <td>
                <button onclick="xoaLoaiSanPham(${index})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Cập nhật dropdown chọn loại
    capNhatDropdownLoai();
}

// Thêm loại sản phẩm mới
function themLoaiSanPham() {
    const tenLoai = document.getElementById("tenLoaiMoi").value;
    const loiNhuan = parseFloat(document.getElementById("loiNhuanLoaiMoi").value);

    if (!tenLoai || isNaN(loiNhuan)) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const maLoai = "L" + (danhSachLoaiSanPham.length + 1).toString().padStart(3, '0');
    danhSachLoaiSanPham.push({
        ma: maLoai,
        ten: tenLoai,
        loiNhuan: loiNhuan
    });

    luuDuLieu();
    hienThiLoaiSanPham();
    
    // Reset form
    document.getElementById("tenLoaiMoi").value = "";
    document.getElementById("loiNhuanLoaiMoi").value = "";
}

// Cập nhật tỉ lệ lợi nhuận loại
function capNhatLoiNhuanLoai(index, giaTri) {
    danhSachLoaiSanPham[index].loiNhuan = parseFloat(giaTri);
    luuDuLieu();
    
    // Cập nhật lại sản phẩm thuộc loại này
    capNhatSanPhamTheoLoai(danhSachLoaiSanPham[index].ma);
}

// Xóa loại sản phẩm
function xoaLoaiSanPham(index) {
    if (confirm("Bạn có chắc muốn xóa loại sản phẩm này?")) {
        // Kiểm tra xem có sản phẩm nào thuộc loại này không
        const spTrongLoai = danhSachSanPham.filter(sp => sp.maLoai === danhSachLoaiSanPham[index].ma);
        if (spTrongLoai.length > 0) {
            alert("Không thể xóa loại sản phẩm vì có sản phẩm thuộc loại này!");
            return;
        }
        
        danhSachLoaiSanPham.splice(index, 1);
        luuDuLieu();
        hienThiLoaiSanPham();
    }
}

// Cập nhật dropdown chọn loại
function capNhatDropdownLoai() {
    const dropdown = document.getElementById("chonLoaiSp");
    const dropdownLoc = document.getElementById("locTheoLoai");
    
    dropdown.innerHTML = '<option value="">Chọn loại sản phẩm</option>';
    dropdownLoc.innerHTML = '<option value="">Tất cả loại</option>';
    
    danhSachLoaiSanPham.forEach(loai => {
        dropdown.innerHTML += `<option value="${loai.ma}">${loai.ten}</option>`;
        dropdownLoc.innerHTML += `<option value="${loai.ma}">${loai.ten}</option>`;
    });
}

// Hiển thị sản phẩm
function hienThiSanPham(danhSach = danhSachSanPham) {
    const tbody = document.querySelector("#bangSanPham tbody");
    tbody.innerHTML = "";

    danhSach.forEach((sp, index) => {
        const loaiSP = danhSachLoaiSanPham.find(loai => loai.ma === sp.maLoai);
        const giaBan = tinhGiaBan(sp.giaVon, sp.loiNhuan);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${sp.ma}</td>
            <td>${loaiSP ? loaiSP.ten : 'N/A'}</td>
            <td>${sp.ten}</td>
            <td>${sp.giaVon.toLocaleString()}đ</td>
            <td>
                <input type="number" value="${sp.loiNhuan}" 
                       onchange="capNhatLoiNhuanSP(${index}, this.value)" 
                       step="0.1" style="width: 80px">
            </td>
            <td>${giaBan.toLocaleString()}đ</td>
            <td>
                <button onclick="xoaSanPham(${index})">Xóa</button>
                <button onclick="suaSanPham(${index})">Sửa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Thêm sản phẩm mới
function themSanPham() {
    const maLoai = document.getElementById("chonLoaiSp").value;
    const tenSP = document.getElementById("tenSpMoi").value;
    const giaVon = parseFloat(document.getElementById("giaVonMoi").value);
    const loiNhuan = parseFloat(document.getElementById("loiNhuanSpMoi").value);

    if (!maLoai || !tenSP || isNaN(giaVon) || isNaN(loiNhuan)) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const maSP = "SP" + (danhSachSanPham.length + 1).toString().padStart(3, '0');
    danhSachSanPham.push({
        ma: maSP,
        maLoai: maLoai,
        ten: tenSP,
        giaVon: giaVon,
        loiNhuan: loiNhuan
    });

    luuDuLieu();
    hienThiSanPham();
    
    // Reset form
    document.getElementById("tenSpMoi").value = "";
    document.getElementById("giaVonMoi").value = "";
    document.getElementById("loiNhuanSpMoi").value = "";
}

// Cập nhật lợi nhuận sản phẩm
function capNhatLoiNhuanSP(index, giaTri) {
    danhSachSanPham[index].loiNhuan = parseFloat(giaTri);
    luuDuLieu();
    hienThiSanPham();
}

// Xóa sản phẩm
function xoaSanPham(index) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        danhSachSanPham.splice(index, 1);
        luuDuLieu();
        hienThiSanPham();
    }
}

// Sửa sản phẩm
function suaSanPham(index) {
    const sp = danhSachSanPham[index];
    const tenMoi = prompt("Tên sản phẩm mới:", sp.ten);
    const giaVonMoi = prompt("Giá vốn mới:", sp.giaVon);
    const loiNhuanMoi = prompt("Tỉ lệ lợi nhuận mới (%):", sp.loiNhuan);

    if (tenMoi && giaVonMoi && loiNhuanMoi) {
        danhSachSanPham[index] = {
            ...sp,
            ten: tenMoi,
            giaVon: parseFloat(giaVonMoi),
            loiNhuan: parseFloat(loiNhuanMoi)
        };
        luuDuLieu();
        hienThiSanPham();
    }
}

// Cập nhật sản phẩm theo loại (khi thay đổi lợi nhuận loại)
function capNhatSanPhamTheoLoai(maLoai) {
    // Có thể thêm logic tự động cập nhật sản phẩm khi thay đổi lợi nhuận loại
    console.log(`Đã cập nhật lợi nhuận cho loại ${maLoai}`);
}

// Tìm kiếm sản phẩm
function timKiemSanPham() {
    const tuKhoa = document.getElementById("timKiemSp").value.toLowerCase();
    const maLoai = document.getElementById("locTheoLoai").value;

    let ketQua = danhSachSanPham.filter(sp => {
        const khopTen = sp.ten.toLowerCase().includes(tuKhoa) || sp.ma.toLowerCase().includes(tuKhoa);
        const khopLoai = !maLoai || sp.maLoai === maLoai;
        return khopTen && khopLoai;
    });

    hienThiBangTraCuu(ketQua);
}

// Hiển thị bảng tra cứu
function hienThiBangTraCuu(danhSach) {
    const tbody = document.querySelector("#bangTraCuu tbody");
    tbody.innerHTML = "";

    danhSach.forEach(sp => {
        const loaiSP = danhSachLoaiSanPham.find(loai => loai.ma === sp.maLoai);
        const giaBan = tinhGiaBan(sp.giaVon, sp.loiNhuan);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${sp.ma}</td>
            <td>${loaiSP ? loaiSP.ten : 'N/A'}</td>
            <td>${sp.ten}</td>
            <td>${sp.giaVon.toLocaleString()}đ</td>
            <td>${sp.loiNhuan}%</td>
            <td>${giaBan.toLocaleString()}đ</td>
        `;
        tbody.appendChild(tr);
    });
}

// Khởi tạo
function khoiTao() {
    hienThiLoaiSanPham();
    hienThiSanPham();
    hienThiBangTraCuu(danhSachSanPham);
}

// Chạy khi trang load
document.addEventListener('DOMContentLoaded', khoiTao);