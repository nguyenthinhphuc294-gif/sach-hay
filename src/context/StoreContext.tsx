import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { useMatch, useNavigate } from 'react-router';
import { requestAdminSession } from '../adminSession';
import { catalogBooks, removeProduct, saveProduct } from '../catalogApi';
import type { ProductInput } from '../catalogApi';
import type { OrderResult } from '../checkout/api';
import {
  Book,
  Category,
  CartItem,
  Order,
  OrderStatus,
  Promotion,
  Banner,
  Review,
  User,
  ActiveView
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_PROMOTIONS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  DEMO_ADMIN
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface StoreContextType {
  // Navigation & View
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  openBookDetail: (book: Book) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  books: Book[];
  categories: Category[];
  banners: Banner[];
  promotions: Promotion[];
  orders: Order[];
  reviews: Review[];
  wishlist: string[];

  // User & Auth
  currentUser: User | null;
  adminStatus: 'checking' | 'guest' | 'authenticated';
  loginAdmin: (username: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number, showToastAlert?: boolean) => boolean;
  removeFromCart: (bookId: string) => void;
  updateCartQuantity: (bookId: string, delta: number) => void;
  toggleCartSelect: (bookId: string) => void;
  toggleSelectAll: () => void;
  cartSubtotal: number;
  cartShipping: number;
  cartTotal: number;
  selectedCartCount: number;
  totalCartItemCount: number;

  // Checkout & Orders
  checkoutSelectedItems: () => void;
  recordCheckout: (result: OrderResult) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => boolean;
  lookupOrder: (orderCode: string, phone: string) => Order | null;
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;

  // Wishlist
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;

  // Reviews
  addReview: (bookId: string, rating: number, comment: string) => void;

  // Admin Operations
  addBook: (book: ProductInput) => Promise<void>;
  updateBook: (book: Book, updates: ProductInput) => Promise<void>;
  deleteBook: (book: Book) => Promise<void>;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  toggleBannerStatus: (id: string) => void;
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  togglePromotionStatus: (id: string) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Views
  const [activeView, updateActiveView] = useState<ActiveView>(() =>
    new URLSearchParams(window.location.search).get('view') === 'admin' ? 'admin' : 'home'
  );
  const aboutRoute = useMatch('/about');
  const navigate = useNavigate();
  const setActiveView = (view: ActiveView) => {
    updateActiveView(view);
    if (aboutRoute) navigate(view === 'admin' ? '/?view=admin' : '/');
  };
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Entities state with localStorage caching
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('sachhay_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });
  const catalogChanges = useRef(new Set<string>());

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sachhay_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('sachhay_banners');
    if (!saved) return INITIAL_BANNERS;
    const cached: Banner[] = JSON.parse(saved);
    return cached.map(banner => ({
      ...banner,
      imageUrl: INITIAL_BANNERS.find(initial => initial.id === banner.id)?.imageUrl ?? banner.imageUrl,
    }));
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('sachhay_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sachhay_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('sachhay_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sachhay_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Default 1 item in cart for quick testing
    return [
      {
        bookId: INITIAL_BOOKS[0].id,
        book: INITIAL_BOOKS[0],
        quantity: 1,
        selected: true
      }
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sachhay_wishlist');
    return saved ? JSON.parse(saved) : ['book-01', 'book-06'];
  });

  const [adminExpiresAt, setAdminExpiresAt] = useState<number | null>(null);
  const isAdmin = adminExpiresAt !== null && adminExpiresAt > Date.now();
  const adminStatus = adminExpiresAt === null ? 'checking' : isAdmin ? 'authenticated' : 'guest';
  const currentUser = isAdmin ? DEMO_ADMIN : null;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sachhay_books', JSON.stringify(books.filter(book => book.source !== 'catalog-api')));
  }, [books]);

  useEffect(() => {
    const controller = new AbortController();
    catalogBooks(controller.signal).then(products => {
      if (controller.signal.aborted) return;
      setBooks(previous => [
        ...previous.filter(book => book.source === 'catalog-api' && catalogChanges.current.has(book.id)),
        ...products.filter(book => !catalogChanges.current.has(book.id)),
        ...previous.filter(book => book.source !== 'catalog-api'),
      ]);
    }).catch(() => { /* The built-in catalog is still available without the API. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    localStorage.setItem('sachhay_orders', JSON.stringify(orders.filter(order => order.source !== 'checkout-api')));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sachhay_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sachhay_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sachhay_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sachhay_promos', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('sachhay_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('sachhay_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.removeItem('sachhay_current_user');
    let mounted = true;
    requestAdminSession().then(
      expiresAt => { if (mounted) setAdminExpiresAt(expiresAt); },
      () => { if (mounted) setAdminExpiresAt(0); },
    );
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!adminExpiresAt) return;
    const timeout = window.setTimeout(() => setAdminExpiresAt(0), Math.max(0, adminExpiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [adminExpiresAt]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAdmin = async (username: string, password: string) => {
    const expiresAt = await requestAdminSession({ action: 'login', username, password });
    if (expiresAt <= Date.now()) throw new Error('Máy chủ chưa cấp phiên quản trị.');
    setAdminExpiresAt(expiresAt);
    showToast('Đã đăng nhập quản trị.', 'success');
  };

  const logoutAdmin = async () => {
    try {
      await requestAdminSession({ action: 'logout' });
      setAdminExpiresAt(0);
      setActiveView('home');
      showToast('Đã đăng xuất quản trị.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Chưa đăng xuất được.', 'error');
    }
  };

  // Open book detail view
  const openBookDetail = (book: Book) => {
    setSelectedBook(book);
    setActiveView('book_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (book: Book, quantity: number = 1, showToastAlert = true): boolean => {
    const currentBook = books.find((b) => b.id === book.id) || book;
    if (currentBook.stock <= 0) {
      showToast(`Sản phẩm "${book.title}" tạm thời hết hàng!`, 'error');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.bookId === book.id);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (existingQty + quantity > currentBook.stock) {
      showToast(`Chỉ còn ${currentBook.stock} cuốn trong kho!`, 'warning');
      return false;
    }

    setCart((prev) => {
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [...prev, { bookId: book.id, book: currentBook, quantity, selected: true }];
    });

    if (showToastAlert) {
      showToast(`Đã thêm "${book.title}" vào giỏ hàng thành công!`, 'success');
    }
    return true;
  };

  const removeFromCart = (bookId: string) => {
    const item = cart.find((i) => i.bookId === bookId);
    setCart((prev) => prev.filter((i) => i.bookId !== bookId));
    if (item) {
      showToast(`Đã xóa "${item.book.title}" khỏi giỏ hàng`, 'info');
    }
  };

  const updateCartQuantity = (bookId: string, delta: number) => {
    const currentBook = books.find((b) => b.id === bookId);
    if (!currentBook) return;

    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.bookId !== bookId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > currentBook.stock) {
            showToast(`Rất tiếc, kho chỉ còn ${currentBook.stock} cuốn!`, 'warning');
            return item;
          }
          return { ...item, quantity: nextQty };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const toggleCartSelect = (bookId: string) => {
    setCart((prev) =>
      prev.map((item) => (item.bookId === bookId ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = cart.every((item) => item.selected);
    setCart((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  // Cart Calculations
  const selectedItems = cart.filter((item) => item.selected);
  const cartSubtotal = selectedItems.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );

  // Free shipping above 250,000 VND, otherwise 25,000 VND
  const cartShipping = cartSubtotal >= 250000 || cartSubtotal === 0 ? 0 : 25000;
  const cartTotal = cartSubtotal + cartShipping;
  const selectedCartCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const checkoutSelectedItems = () => {
    if (selectedItems.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!', 'warning');
      return;
    }
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordCheckout = ({ order, inventory }: OrderResult) => {
    const byBook = new Map(inventory.map(item => [item.bookId, item]));
    const quantities = new Map(order.items.map(item => [item.bookId, item.quantity]));
    setBooks(previous => previous.map(book => {
      const stock = byBook.get(book.id);
      if (!stock) return book;
      return { ...book, stock: stock.stock, soldCount: stock.soldCount };
    }));
    setOrders(previous => [order, ...previous.filter(existing => existing.id !== order.id)]);
    setCart(previous => previous.flatMap(item => {
      const quantity = item.quantity - (quantities.get(item.bookId) ?? 0);
      if (quantity <= 0) return [];
      const stock = byBook.get(item.bookId);
      return [{ ...item, quantity, book: stock ? { ...item.book, stock: stock.stock, soldCount: stock.soldCount } : item.book }];
    }));
    setLastCreatedOrder(order);
    showToast(`Đặt hàng thành công. Mã đơn: ${order.orderCode}`, 'success');
  };

  // Order status update (Admin)
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    if (orders.find(order => order.id === orderId)?.source === 'checkout-api') return;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        // If cancelling, restore stock
        if (newStatus === 'cancelled' && order.status !== 'cancelled') {
          setBooks((prevBooks) =>
            prevBooks.map((b) => {
              const orderedItem = order.items.find((i) => i.bookId === b.id);
              if (orderedItem) {
                return {
                  ...b,
                  stock: b.stock + orderedItem.quantity,
                  soldCount: Math.max(0, b.soldCount - orderedItem.quantity)
                };
              }
              return b;
            })
          );
        }

        const defaultNotes: Record<OrderStatus, string> = {
          pending: 'Đơn chờ xác nhận',
          confirmed: 'Nhà sách Sách Hay đã xác nhận đơn hàng',
          processing: 'Đang đóng gói và kiểm tra niêm phong',
          shipping: 'Bưu tá Sách Hay Express đang giao hàng',
          completed: 'Đã giao thành công đến khách hàng',
          cancelled: 'Đơn hàng đã được hủy'
        };

        const newHistory = [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp,
            note: note || defaultNotes[newStatus]
          }
        ];

        return {
          ...order,
          status: newStatus,
          statusHistory: newHistory
        };
      })
    );

    showToast(`Cập nhật trạng thái đơn hàng thành: ${newStatus}`, 'info');
  };

  // Cancel order by customer
  const cancelOrder = (orderId: string, reason: string = 'Khách hàng yêu cầu hủy đơn'): boolean => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || target.source === 'checkout-api') return false;

    if (target.status !== 'pending' && target.status !== 'confirmed') {
      showToast('Đơn hàng đã xuất kho vận chuyển, không thể tự hủy!', 'error');
      return false;
    }

    updateOrderStatus(orderId, 'cancelled', reason);
    showToast('Hủy đơn hàng thành công, số lượng sách đã được hoàn lại kho.', 'success');
    return true;
  };

  // Lookup order by code and phone
  const lookupOrder = (orderCode: string, phone: string): Order | null => {
    const normalizedCode = orderCode.trim().toUpperCase();
    const normalizedPhone = phone.trim().replace(/\s+/g, '');
    return (
      orders.find(
        (o) =>
          o.orderCode.toUpperCase() === normalizedCode &&
          o.phone.replace(/\s+/g, '') === normalizedPhone &&
          !INITIAL_ORDERS.some(sample => sample.id === o.id)
      ) || null
    );
  };

  // Wishlist
  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(bookId);
      if (exists) {
        showToast('Đã xóa khỏi danh sách yêu thích', 'info');
        return prev.filter((id) => id !== bookId);
      } else {
        showToast('Đã lưu vào danh sách yêu thích', 'success');
        return [...prev, bookId];
      }
    });
  };

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  // Reviews
  const addReview = (bookId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      bookId,
      userName: currentUser?.name || 'Khách hàng ẩn danh',
      rating,
      comment,
      createdAt: new Date().toISOString().slice(0, 10),
      verifiedPurchase: true
    };
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate book average rating
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const totalRatings = b.rating * b.reviewCount + rating;
        const newCount = b.reviewCount + 1;
        const newAvg = Number((totalRatings / newCount).toFixed(1));
        return { ...b, rating: newAvg, reviewCount: newCount };
      })
    );

    showToast('Cảm ơn bạn đã gửi đánh giá cho cuốn sách này!', 'success');
  };

  // Admin Operations
  const addBook = async (newBookData: ProductInput) => {
    if (!isAdmin) throw new Error('Vui lòng đăng nhập lại trang quản trị.');
    const newBook = await saveProduct(newBookData);
    if (!newBook) throw new Error('Chưa lưu được sản phẩm.');
    catalogChanges.current.add(newBook.id);
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Đã thêm mới sách "${newBook.title}"`, 'success');
  };

  const updateBook = async (book: Book, updates: ProductInput) => {
    if (!isAdmin) throw new Error('Vui lòng đăng nhập lại trang quản trị.');
    if (book.source === 'catalog-api') {
      const saved = await saveProduct({ ...updates, expectedStock: book.stock }, book.id);
      if (!saved) throw new Error('Chưa cập nhật được sản phẩm.');
      catalogChanges.current.add(book.id);
      setBooks(previous => previous.map(item => item.id === book.id ? saved : item));
    } else {
      const { cover, ...fields } = updates;
      const coverImage = cover ? 'data:image/jpeg;base64,' + cover : book.coverImage;
      const discountPercent = fields.originalPrice > fields.price ? Math.round((1 - fields.price / fields.originalPrice) * 100) : 0;
      const updatedBooks = books.map(item => item.id === book.id ? {
        ...item, ...fields, discountPercent, coverImage, thumbnails: cover ? [coverImage] : item.thumbnails,
      } : item);
      try {
        localStorage.setItem('sachhay_books', JSON.stringify(updatedBooks.filter(item => item.source !== 'catalog-api')));
      } catch {
        throw new Error('Bộ nhớ trình duyệt đã đầy. Hãy thử ảnh nhỏ hơn.');
      }
      setBooks(updatedBooks);
    }
    showToast('Đã cập nhật thông tin sách thành công', 'success');
  };

  const deleteBook = async (book: Book) => {
    if (!isAdmin) throw new Error('Vui lòng đăng nhập lại trang quản trị.');
    if (book.source === 'catalog-api') {
      await removeProduct(book.id);
      catalogChanges.current.add(book.id);
      setBooks(previous => previous.filter(item => item.id !== book.id));
    } else {
      setBooks(previous => previous.map(item => item.id === book.id ? { ...item, isDeleted: true } : item));
    }
    showToast('Đã xóa mềm cuốn sách khỏi hệ thống', 'info');
  };

  const addCategory = (catData: Omit<Category, 'id'>) => {
    if (!isAdmin) return;
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Đã thêm danh mục "${newCat.name}"`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (!isAdmin) return;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Đã cập nhật danh mục', 'success');
  };

  const toggleBannerStatus = (id: string) => {
    if (!isAdmin) return;
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
    showToast('Đã cập nhật trạng thái hiển thị banner', 'info');
  };

  const addPromotion = (promoData: Omit<Promotion, 'id' | 'usageCount'>) => {
    if (!isAdmin) return;
    const newPromo: Promotion = {
      ...promoData,
      id: `promo-${Date.now()}`,
      usageCount: 0
    };
    setPromotions((prev) => [newPromo, ...prev]);
    showToast(`Đã tạo mã khuyến mãi ${newPromo.code}`, 'success');
  };

  const togglePromotionStatus = (id: string) => {
    if (!isAdmin) return;
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    showToast('Đã thay đổi trạng thái mã khuyến mãi', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedBook,
        setSelectedBook,
        openBookDetail,
        selectedCategorySlug,
        setSelectedCategorySlug,
        searchQuery,
        setSearchQuery,
        books: books.filter((b) => !b.isDeleted),
        categories,
        banners,
        promotions,
        orders,
        reviews,
        wishlist,
        currentUser,
        adminStatus,
        loginAdmin,
        logoutAdmin,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleCartSelect,
        toggleSelectAll,
        cartSubtotal,
        cartShipping,
        cartTotal,
        selectedCartCount,
        totalCartItemCount,
        checkoutSelectedItems,
        recordCheckout,
        updateOrderStatus: (id, status, note) => { if (isAdmin) updateOrderStatus(id, status, note); },
        cancelOrder,
        lookupOrder,
        lastCreatedOrder,
        setLastCreatedOrder,
        toggleWishlist,
        isInWishlist,
        addReview,
        addBook,
        updateBook,
        deleteBook,
        addCategory,
        updateCategory,
        toggleBannerStatus,
        addPromotion,
        togglePromotionStatus,
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
