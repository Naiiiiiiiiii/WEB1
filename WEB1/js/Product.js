/**
 * Product.js
 * Class định nghĩa cấu trúc và phương thức cho sản phẩm
 */

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.price = data.price;
    this.oldPrice = data.oldPrice || null;
    this.img = data.img;
    this.rating = data.rating || 0;
    this.ratingCount = data.ratingCount || 0;
    this.badge = data.badge || null;
    this.description = data.description || '';
  }

  // Tính phần trăm giảm giá
  getDiscountPercent() {
    if (!this.oldPrice || this.oldPrice <= this.price) return 0;
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }

  // Kiểm tra có đang giảm giá không
  isOnSale() {
    return this.oldPrice && this.oldPrice > this.price;
  }

  // Format giá tiền
  getFormattedPrice() {
    return new Intl.NumberFormat('vi-VN').format(this.price) + '₫';
  }

  // Format giá cũ
  getFormattedOldPrice() {
    if (!this.oldPrice) return '';
    return new Intl.NumberFormat('vi-VN').format(this.oldPrice) + '₫';
  }

  // Lấy text badge
  getBadgeText() {
    if (!this.badge) return '';
    
    switch(this.badge) {
      case 'hot':
        return 'Hot';
      case 'new':
        return 'Mới';
      case 'sale':
        return this.isOnSale() ? `-${this.getDiscountPercent()}%` : 'Sale';
      default:
        return this.badge;
    }
  }

  // Render HTML cho rating stars
  renderStars() {
    const rating = Math.round(this.rating) || 0;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="${i <= rating ? 'fas' : 'far'} fa-star" aria-hidden="true"></i>`;
    }
    return html;
  }

  // Chuyển đổi thành object đơn giản
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      price: this.price,
      oldPrice: this.oldPrice,
      img: this.img,
      rating: this.rating,
      ratingCount: this.ratingCount,
      badge: this.badge,
      description: this.description
    };
  }

  // Tạo instance từ object
  static fromJSON(data) {
    return new Product(data);
  }
}