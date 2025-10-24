
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

// Quản lý danh sách User với LocalStorage
class UserManager {
  constructor() {
    this.STORAGE_KEY = 'shoestore_users';
    this.CURRENT_USER_KEY = 'nguoiDungHienTai'; 
    this.users = this.taiDanhSachUser();
  }

  // Tải danh sách user từ LocalStorage
  taiDanhSachUser() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const usersData = JSON.parse(data);
        return usersData.map(u => new User(u.hoTen, u.tenDangNhap, u.email, u.matKhau));
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách user:', error);
    }
    
    //  tạo tài khoản admin mặc định
    return [
      new User("Admin ShoeStore", "admin", "admin@shoestore.com", "Admin123")
    ];
  }

  // Lưu danh sách user vào LocalStorage
  luuDanhSachUser() {
    try {
      const usersData = this.users.map(u => ({
        hoTen: u.hoTen,
        tenDangNhap: u.tenDangNhap,
        email: u.email,
        matKhau: u.matKhau
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usersData));
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu danh sách user:', error);
      return false;
    }
  }

  
  capNhatUser(userMoi) {
    const index = this.users.findIndex(u => u.tenDangNhap === userMoi.tenDangNhap);

    if (index !== -1) {
      // Cập nhật các thuộc tính
      this.users[index].hoTen = userMoi.hoTen;
      this.users[index].email = userMoi.email;
      this.users[index].matKhau = userMoi.matKhau; 
      
      // Lưu danh sách users đã cập nhật vào LocalStorage
      return this.luuDanhSachUser(); 
    }
    return false;
  }
  
  // Lưu thông tin user hiện tại đang đăng nhập
  luuUserHienTai(user) {
    try {
      const userData = {
        hoTen: user.hoTen,
        tenDangNhap: user.tenDangNhap,
        email: user.email,
        matKhau: user.matKhau, 
        thoiGianDangNhap: new Date().toISOString()
      };
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu user hiện tại:', error);
      return false;
    }
  }

  // Lấy thông tin user hiện tại
  layUserHienTai() {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy user hiện tại:', error);
    }
    return null;
  }

  // Đăng xuất
  dangXuat() {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      return true;
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      return false;
    }
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
    this.luuDanhSachUser(); // Lưu vào LocalStorage
    return user;
  }
}

export { User, UserManager };