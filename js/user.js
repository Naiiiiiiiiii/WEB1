// Định nghĩa class User
class User {
  constructor(hoTen, tenDangNhap, email, matKhau) {
    this.hoTen = hoTen;
    this.tenDangNhap = tenDangNhap;
    this.email = email;
    this.matKhau = matKhau;
  }

  // Kiểm tra mật khẩu
  kiemTraMatKhau(matKhauNhap) {
    return this.matKhau === matKhauNhap;
  }
}

// Quản lý danh sách User
class UserManager {
  constructor() {
    this.users = [
      new User("Admin ShoeStore", "admin", "admin@shoestore.com", "Admin123")
    ];
  }

  // Tìm user theo username/email + password
  timTaiKhoan(tenDangNhap, matKhau) {
    return this.users.find(
      u =>
        (u.tenDangNhap === tenDangNhap || u.email === tenDangNhap) &&
        u.kiemTraMatKhau(matKhau)
    );
  }

  // Kiểm tra trùng username
  tonTaiTenDangNhap(tenDangNhap) {
    return this.users.some(u => u.tenDangNhap === tenDangNhap);
  }

  // Kiểm tra trùng email
  tonTaiEmail(email) {
    return this.users.some(u => u.email === email);
  }

  // Thêm user mới
  themTaiKhoan(hoTen, tenDangNhap, email, matKhau) {
    const user = new User(hoTen, tenDangNhap, email, matKhau);
    this.users.push(user);
    return user;
  }
}

export { User, UserManager };