/**
 * productData.js
 * File lưu trữ dữ liệu các sản phẩm có sẵn
 * Yêu cầu: Product.js phải được load trước file này
 */

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

// Khởi tạo mảng products từ Product class
const products = productDataList.map(data => new Product(data));