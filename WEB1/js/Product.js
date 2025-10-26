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
    this.description = data.description || "";

    this.hidden = !!data.hidden;
    this.images = Array.isArray(data.images)
      ? data.images
      : data.img
      ? [data.img]
      : [];
  }

  getDiscountPercent() {
    if (!this.oldPrice || this.oldPrice <= this.price) return 0;
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }

  isOnSale() {
    return this.oldPrice && this.oldPrice > this.price;
  }

  getFormattedPrice() {
    return new Intl.NumberFormat("vi-VN").format(this.price) + "₫";
  }

  getFormattedOldPrice() {
    if (!this.oldPrice) return "";
    return new Intl.NumberFormat("vi-VN").format(this.oldPrice) + "₫";
  }

  getBadgeText() {
    if (!this.badge) return "";
    switch (this.badge) {
      case "hot":
        return "Hot";
      case "new":
        return "Mới";
      case "sale":
        return this.isOnSale() ? `-${this.getDiscountPercent()}%` : "Sale";
      default:
        return this.badge;
    }
  }

  renderStars() {
    const rating = Math.round(this.rating) || 0;
    let html = "";
    for (let i = 1; i <= 5; i++) {
      html += `<i class="${
        i <= rating ? "fas" : "far"
      } fa-star" aria-hidden="true"></i>`;
    }
    return html;
  }

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
      description: this.description,
      hidden: this.hidden,
      images: this.images,
    };
  }

  static fromJSON(data) {
    return new Product(data);
  }
}
