export type BookFormat = 'Bìa mềm' | 'Bìa cứng' | 'Hộp quà tặng';

export interface Book {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorId: string;
  publisher: string;
  supplier: string;
  isbn: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  coverImage: string;
  thumbnails: string[];
  categoryId: string;
  categoryName: string;
  stock: number;
  soldCount: number;
  rating: number;
  reviewCount: number;
  format: BookFormat;
  publicationYear: number;
  pages: number;
  language: string;
  dimensions: string;
  weight: number; // in grams
  description: string;
  shortDescription?: string;
  isFlashSale?: boolean;
  flashSaleRemaining?: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  isDeleted?: boolean;
  source?: 'catalog-api';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  parentId?: string | null;
  subcategories?: string[];
  bookCount: number;
  isQuickNav?: boolean;
}

export interface Author {
  id: string;
  name: string;
  nationality: string;
  bookCount: number;
  biography?: string;
}

export interface Publisher {
  id: string;
  name: string;
  address?: string;
}

export interface CartItem {
  bookId: string;
  book: Book;
  quantity: number;
  selected: boolean;
}

export type OrderStatus =
  | 'pending'     // Chờ xác nhận
  | 'confirmed'   // Đã xác nhận
  | 'processing'  // Đang chuẩn bị
  | 'shipping'    // Đang giao
  | 'completed'   // Hoàn thành
  | 'cancelled';  // Đã hủy

export interface OrderItem {
  bookId: string;
  title: string;
  coverImage: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  source?: 'checkout-api';
  orderCode: string;
  customerName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  notes?: string;
  paymentMethod: 'COD' | 'STORE_PICKUP' | 'BANK_TRANSFER';
  paymentStatus?: 'pending' | 'paid';
  paidAt?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  statusHistory: OrderStatusHistory[];
  voucherCode?: string;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
  description: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkTarget: string;
  type: 'hero' | 'promo_side' | 'flash_sale';
  isActive: boolean;
  sortOrder: number;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  addresses: {
    id: string;
    isDefault: boolean;
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    street: string;
  }[];
}

export type ActiveView =
  | 'home'
  | 'catalog'
  | 'book_detail'
  | 'cart'
  | 'checkout'
  | 'order_tracking'
  | 'account'
  | 'admin';
