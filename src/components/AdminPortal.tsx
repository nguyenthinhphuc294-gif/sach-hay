import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { prepareBookCover } from '../catalogApi';
import { Book, Order, OrderStatus, Category, Promotion } from '../types';
import { SACHHAY_SQL_SCRIPT } from '../data/sqlScript';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  ShoppingBag,
  TicketPercent,
  Image as ImageIcon,
  Database,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Copy,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Eye,
  X
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'books'
  | 'categories'
  | 'orders'
  | 'promotions'
  | 'banners'
  | 'database';

export const AdminPortal: React.FC = () => {
  const {
    books,
    categories,
    orders: storedOrders,
    promotions,
    banners,
    updateOrderStatus,
    addBook,
    updateBook,
    deleteBook,
    addCategory,
    addPromotion,
    togglePromotionStatus,
    toggleBannerStatus,
    showToast
  } = useStore();
  const orders = storedOrders.filter(order => order.source !== 'checkout-api');

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Book Modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Invoice / Print Slip modal state
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // New book form state
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('NXB Trẻ');
  const [bookPrice, setBookPrice] = useState(80000);
  const [bookOriginalPrice, setBookOriginalPrice] = useState(100000);
  const [bookStock, setBookStock] = useState(50);
  const [bookCategory, setBookCategory] = useState(categories[0]?.id || 'cat-van-hoc');
  const [bookIsbn, setBookIsbn] = useState('978-604-000-000-0');
  const [bookDescription, setBookDescription] = useState('');
  const [bookCover, setBookCover] = useState<Awaited<ReturnType<typeof prepareBookCover>> | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [bookSaving, setBookSaving] = useState(false);
  const [bookError, setBookError] = useState('');
  const coverAttempt = useRef(0);
  const savingBook = useRef(false);

  // Search in Admin tables
  const [bookFilterQuery, setBookFilterQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');

  // Metrics calculation
  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'shipping')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockBooks = books.filter((b) => b.stock <= 10);
  const totalSoldBooks = books.reduce((sum, b) => sum + b.soldCount, 0);

  // Handle open add / edit modal
  const resetBookCover = () => {
    coverAttempt.current += 1;
    setBookCover(null);
    setCoverLoading(false);
    setBookError('');
  };

  const closeBookModal = () => {
    if (savingBook.current) return;
    resetBookCover();
    setIsBookModalOpen(false);
  };

  const handleOpenAddBook = () => {
    resetBookCover();
    setEditingBook(null);
    setBookTitle('');
    setBookAuthor('');
    setBookPublisher('NXB Trẻ');
    setBookPrice(85000);
    setBookOriginalPrice(100000);
    setBookStock(40);
    setBookCategory(categories[0]?.id || 'cat-van-hoc');
    setBookIsbn(`978-604-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-1`);
    setBookDescription('');
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    resetBookCover();
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookPublisher(book.publisher);
    setBookPrice(book.price);
    setBookOriginalPrice(book.originalPrice);
    setBookStock(book.stock);
    setBookCategory(book.categoryId);
    setBookIsbn(book.isbn);
    setBookDescription(book.description);
    setIsBookModalOpen(true);
  };

  const handleBookCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    const attempt = ++coverAttempt.current;
    setBookCover(null);
    setBookError('');
    setCoverLoading(Boolean(file));
    if (!file) return;
    try {
      const result = await prepareBookCover(file);
      if (attempt === coverAttempt.current) setBookCover(result);
    } catch (error) {
      if (attempt !== coverAttempt.current) return;
      input.value = '';
      setBookError(error instanceof Error ? error.message : 'Không đọc được ảnh bìa.');
    } finally {
      if (attempt === coverAttempt.current) setCoverLoading(false);
    }
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingBook.current || coverLoading) return;
    if (!editingBook && !bookCover) {
      setBookError('Vui lòng chọn ảnh bìa trước khi lưu sách.');
      return;
    }
    const catObj = categories.find((c) => c.id === bookCategory);
    const product = {
      title: bookTitle.trim(), author: bookAuthor.trim(), publisher: bookPublisher.trim(),
      price: bookPrice, originalPrice: bookOriginalPrice, stock: bookStock,
      categoryId: bookCategory, categoryName: catObj?.name || 'Sách khác',
      isbn: bookIsbn.trim(), description: bookDescription.trim(), cover: bookCover?.cover,
    };
    savingBook.current = true;
    setBookSaving(true);
    setBookError('');
    try {
      if (editingBook) await updateBook(editingBook, product);
      else await addBook(product);
      resetBookCover();
      setIsBookModalOpen(false);
    } catch (error) {
      setBookError(error instanceof Error ? error.message : 'Chưa lưu được sản phẩm.');
    } finally {
      savingBook.current = false;
      setBookSaving(false);
    }
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SACHHAY_SQL_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SACHHAY_DB.sql';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file script SQL Server: SACHHAY_DB.sql', 'success');
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SACHHAY_SQL_SCRIPT);
      showToast('Đã sao chép toàn bộ mã SQL vào bộ nhớ tạm!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Top Bar for Admin */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            Hệ Thống Quản Trị
          </span>
          <h1 className="text-xl sm:text-2xl font-black">
            Sách Hay Administrator Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý toàn bộ danh mục, kho sách, đơn hàng, marketing và database SQL Server
          </p>
        </div>

        {/* Quick Database Export CTA */}
        <button
          onClick={() => setActiveTab('database')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm self-start md:self-auto"
        >
          <Database className="w-4 h-4" />
          <span>Xem & Tải SQL Server Script</span>
        </button>
      </div>

      {/* ADMIN TABS STRIP */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-xl border border-[#E5E5E5] mb-6 shadow-xs">
        {[
          { id: 'dashboard' as AdminTab, label: 'Tổng Quan (Dashboard)', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'books' as AdminTab, label: `Sách & Kho (${books.length})`, icon: <BookOpen className="w-4 h-4" /> },
          { id: 'orders' as AdminTab, label: `Đơn Hàng (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'categories' as AdminTab, label: `Danh Mục (${categories.length})`, icon: <FolderTree className="w-4 h-4" /> },
          { id: 'promotions' as AdminTab, label: `Khuyến Mãi (${promotions.length})`, icon: <TicketPercent className="w-4 h-4" /> },
          { id: 'banners' as AdminTab, label: `Banners (${banners.length})`, icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'database' as AdminTab, label: 'Cơ Sở Dữ Liệu SQL', icon: <Database className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#C92127] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Doanh Thu Dự Kiến
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#C92127] font-mono tabular-nums">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                ↑ +18.4% so với tuần trước
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tổng Đơn Hàng
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
                {orders.length}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                {pendingOrdersCount} đơn chờ xác nhận
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tổng Sách Trong Kho
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
                {books.reduce((acc, b) => acc + b.stock, 0)} cuốn
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Đã bán: {totalSoldBooks.toLocaleString('vi-VN')} cuốn
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Cảnh Báo Tồn Kho Thấp
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono tabular-nums">
                {lowStockBooks.length} tựa sách
              </div>
              <span className="text-[11px] text-red-600 font-semibold mt-1 block">
                Cần nhập bổ sung sớm
              </span>
            </div>
          </div>

          {/* Revenue Chart Visual Simulation */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Doanh Thu Bán Hàng 7 Ngày Gần Nhất (VND)</span>
              <span className="text-xs text-slate-400 font-normal">Cập nhật theo thời gian thực</span>
            </h3>

            {/* Simulated bar chart with tabular numbers */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 px-2">
              {[
                { day: 'T2 (03/11)', value: 1850000, height: '45%' },
                { day: 'T3 (04/11)', value: 2400000, height: '60%' },
                { day: 'T4 (05/11)', value: 2100000, height: '52%' },
                { day: 'T5 (06/11)', value: 3100000, height: '78%' },
                { day: 'T6 (07/11)', value: 2900000, height: '72%' },
                { day: 'T7 (08/11)', value: 3800000, height: '95%' },
                { day: 'CN (Hôm nay)', value: 4200000, height: '100%' }
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-[#C92127] hidden sm:block">
                    {(bar.value / 1000000).toFixed(1)}Tr
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-[#C92127] to-[#F7941E] rounded-t-lg transition-all duration-500 hover:opacity-90"
                    style={{ height: bar.height }}
                  ></div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 truncate">
                    {bar.day.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders table */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              Đơn Hàng Gần Đây Cần Xử Lý
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Mã Đơn</th>
                    <th className="p-3">Khách Hàng</th>
                    <th className="p-3">Số ĐT</th>
                    <th className="p-3">Tổng Tiền</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#C92127]">{ord.orderCode}</td>
                      <td className="p-3 font-semibold text-slate-900">{ord.customerName}</td>
                      <td className="p-3 font-mono text-slate-600">{ord.phone}</td>
                      <td className="p-3 font-mono font-bold">{ord.total.toLocaleString('vi-VN')}đ</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setPrintingOrder(ord);
                          }}
                          className="text-[#C92127] hover:underline font-bold"
                        >
                          In Phiếu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKS & INVENTORY MANAGEMENT */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm sách theo tên, tác giả, ISBN..."
                value={bookFilterQuery}
                onChange={(e) => setBookFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenAddBook}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C92127] hover:bg-[#A5181E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sách Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Bìa</th>
                  <th className="p-3">Tựa Sách & Tác Giả</th>
                  <th className="p-3">Danh Mục</th>
                  <th className="p-3">Giá Bán</th>
                  <th className="p-3">Tồn Kho</th>
                  <th className="p-3">Đã Bán</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books
                  .filter((b) =>
                    bookFilterQuery
                      ? b.title.toLowerCase().includes(bookFilterQuery.toLowerCase()) ||
                        b.author.toLowerCase().includes(bookFilterQuery.toLowerCase()) ||
                        b.isbn.toLowerCase().includes(bookFilterQuery.toLowerCase())
                      : true
                  )
                  .map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-9 h-12 object-cover rounded border border-slate-200"
                        />
                      </td>
                      <td className="p-3">
                        <strong className="font-bold text-slate-900 block truncate max-w-xs">
                          {book.title}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {book.author} · ISBN: {book.isbn}
                        </span>
                      </td>
                      <td className="p-3">{book.categoryName}</td>
                      <td className="p-3 font-mono font-bold text-[#C92127]">
                        {book.price.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 font-mono">
                        <span
                          className={`font-bold ${
                            book.stock <= 10 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded' : 'text-slate-800'
                          }`}
                        >
                          {book.stock} cuốn
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{book.soldCount}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditBook(book)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Chỉnh sửa sách"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa mềm cuốn sách "${book.title}"?`)) {
                              void deleteBook(book).catch(error => showToast(error.message, 'error'));
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Xóa mềm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quản Lý Đơn Hàng & Vận Chuyển ({orders.length})
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Lọc theo trạng thái:</span>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang chuẩn bị</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Khách Hàng & SĐT</th>
                  <th className="p-3">Địa Chỉ Giao</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Trạng Thái Hiện Tại</th>
                  <th className="p-3 text-right">Chuyển Trạng Thái</th>
                  <th className="p-3 text-right">In Phiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter((o) => (orderFilterStatus === 'all' ? true : o.status === orderFilterStatus))
                  .map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-[#C92127]">{ord.orderCode}</td>
                      <td className="p-3">
                        <strong className="text-slate-900 block">{ord.customerName}</strong>
                        <span className="font-mono text-slate-500">{ord.phone}</span>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-600">
                        {ord.address}, {ord.ward}, {ord.province}
                      </td>
                      <td className="p-3 font-mono font-bold">{ord.total.toLocaleString('vi-VN')}đ</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'shipping'
                              ? 'bg-blue-50 text-blue-700'
                              : ord.status === 'cancelled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              ord.id,
                              e.target.value as OrderStatus,
                              `Admin cập nhật trạng thái sang ${e.target.value}`
                            )
                          }
                          className="p-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#C92127]"
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="processing">Đang chuẩn bị</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Hủy đơn (Hoàn tồn)</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setPrintingOrder(ord)}
                          className="p-1.5 text-slate-600 hover:text-[#C92127] hover:bg-red-50 rounded"
                          title="In phiếu xuất kho"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Danh Mục Sản Phẩm ({categories.length})
            </h3>
            <button
              onClick={() => {
                const name = prompt('Nhập tên danh mục mới:');
                if (name?.trim()) {
                  const slug = name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '-');
                  addCategory({
                    slug,
                    name: name.trim(),
                    iconName: 'BookOpen',
                    bookCount: 0,
                    isQuickNav: true,
                    subcategories: []
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E]"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh Mục</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{cat.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">slug: {cat.slug}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Số lượng sách: {books.filter((b) => b.categoryId === cat.id).length} cuốn
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Mã Khuyến Mãi & Giảm Giá ({promotions.length})
            </h3>
            <button
              onClick={() => {
                const code = prompt('Nhập mã voucher (VD: GIAM30K):');
                if (code?.trim()) {
                  addPromotion({
                    code: code.trim().toUpperCase(),
                    title: `Ưu đãi ${code.trim().toUpperCase()}`,
                    discountType: 'fixed',
                    discountValue: 30000,
                    minOrderValue: 200000,
                    expiresAt: '2026-12-31',
                    isActive: true,
                    description: 'Mã tạo bởi Admin'
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E]"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mã Voucher</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {promotions.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all ${
                  p.isActive ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-black font-mono text-[#C92127]">{p.code}</span>
                  <button
                    onClick={() => togglePromotionStatus(p.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                      p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {p.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800">{p.title}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Đơn tối thiểu: {p.minOrderValue.toLocaleString('vi-VN')}đ
                </p>
                <span className="text-[10px] text-slate-400 block mt-2 font-mono">
                  Đã sử dụng: {p.usageCount} lượt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BANNERS */}
      {activeTab === 'banners' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
            Quản Lý Banner Quảng Cáo ({banners.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <img src={b.imageUrl} alt={b.title} className="w-full h-36 object-cover" />
                <div className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 truncate max-w-xs">{b.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Loại: {b.type}</span>
                  </div>
                  <button
                    onClick={() => toggleBannerStatus(b.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      b.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {b.isActive ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. DATABASE & SQL SERVER SCRIPT VIEWER */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C92127]" />
                <span>Cơ Sở Dữ Liệu Microsoft SQL Server (SACHHAY_DB)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                DDL, Constraints (PK/FK/CHECK/UNIQUE), Stored Procedures, Transactions, và Dữ Liệu
                Mẫu
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép Script</span>
              </button>

              <button
                onClick={handleDownloadSql}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C92127] hover:bg-[#A5181E] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải SACHHAY_DB.sql</span>
              </button>
            </div>
          </div>

          {/* Database Schema Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Tên Database:</span>
              <strong className="text-slate-900 font-mono">SACHHAY_DB</strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Tổng số bảng:</span>
              <strong className="text-slate-900 font-mono">24 Tables</strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Cơ chế giao dịch:</span>
              <strong className="text-[#C92127] font-semibold">ACID / Rollback</strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 block">Mã hóa mật khẩu:</span>
              <strong className="text-emerald-700 font-semibold">PBKDF2 / SHA256</strong>
            </div>
          </div>

          {/* SQL Code Preview Container */}
          <div className="relative">
            <pre className="bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed p-4 rounded-xl max-h-[500px] overflow-y-auto border border-slate-800 selection:bg-red-800">
              {SACHHAY_SQL_SCRIPT}
            </pre>
          </div>
        </div>
      )}

      {/* BOOK EDIT / ADD MODAL */}
      {isBookModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeBookModal}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                {editingBook ? 'Chỉnh Sửa Sách' : 'Thêm Sách Mới'}
              </h3>
              <button
                type="button"
                aria-label="Đóng form sản phẩm"
                disabled={bookSaving}
                onClick={closeBookModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="mt-4 space-y-3 text-xs">
              <div>
                <label htmlFor="admin-book-cover" className="mb-1 block font-bold text-slate-700">Ảnh bìa sách</label>
                <div className="flex items-start gap-3">
                  {(bookCover || editingBook?.coverImage) && (
                    <img src={bookCover?.preview ?? editingBook?.coverImage} alt="Xem trước ảnh bìa"
                      className="h-24 w-16 shrink-0 rounded border border-slate-200 bg-slate-50 object-contain" />
                  )}
                  <div className="min-w-0 flex-1">
                    <input id="admin-book-cover" type="file" accept="image/jpeg,image/png,image/webp"
                      required={!editingBook} disabled={bookSaving} onChange={handleBookCover}
                      className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2 file:mr-2 file:font-semibold" />
                    <p className="mt-1 text-slate-600">JPG, PNG hoặc WebP, tối đa 12 MB. {editingBook && 'Để trống nếu giữ ảnh cũ.'}</p>
                    {coverLoading && <p role="status" className="mt-1 text-slate-600">Đang xử lý ảnh…</p>}
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="admin-book-title" className="block text-slate-700 font-bold mb-1">Tên sách:</label>
                <input
                  id="admin-book-title"
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="admin-book-author" className="block text-slate-700 font-bold mb-1">Tác giả:</label>
                  <input
                    id="admin-book-author"
                    type="text"
                    required
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nhà xuất bản:</label>
                  <input
                    type="text"
                    required
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Giá bán (VND):</label>
                  <input
                    type="number"
                    required
                    value={bookPrice}
                    onChange={(e) => setBookPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Giá gốc (VND):</label>
                  <input
                    type="number"
                    required
                    value={bookOriginalPrice}
                    onChange={(e) => setBookOriginalPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số lượng tồn:</label>
                  <input
                    type="number"
                    required
                    value={bookStock}
                    onChange={(e) => setBookStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Danh mục:</label>
                  <select
                    value={bookCategory}
                    onChange={(e) => setBookCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ISBN:</label>
                  <input
                    type="text"
                    required
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả tóm tắt:</label>
                <textarea
                  rows={3}
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Nội dung giới thiệu cuốn sách..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {bookError && <p role="alert" className="text-red-700">{bookError}</p>}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={bookSaving}
                  onClick={closeBookModal}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={coverLoading || bookSaving}
                  className="px-4 py-2 bg-[#C92127] text-white rounded-lg font-bold hover:bg-[#A5181E] disabled:opacity-60"
                >
                  {bookSaving ? 'Đang lưu…' : editingBook ? 'Cập Nhật' : 'Lưu Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT INVOICE SLIP MODAL */}
      {printingOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPrintingOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#C92127]" />
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Phiếu Giao Hàng & Đóng Gói (Sách Hay Express)
                </h3>
              </div>
              <button
                onClick={() => setPrintingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 border border-slate-200 rounded-xl space-y-3 text-xs bg-slate-50/40">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Nhà Sách Sách Hay
                  </span>
                  <h4 className="font-mono font-black text-sm text-[#C92127]">
                    {printingOrder.orderCode}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">
                    Ngày: {new Date(printingOrder.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p>
                  <strong>Người nhận:</strong> {printingOrder.customerName} - {printingOrder.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {printingOrder.address}, {printingOrder.ward},{' '}
                  {printingOrder.district}, {printingOrder.province}
                </p>
                <p>
                  <strong>Hình thức:</strong>{' '}
                  {printingOrder.paymentMethod === 'COD' ? 'Thu hộ COD' : 'Nhận tại cửa hàng'}
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <span className="font-bold block">Danh mục sách:</span>
                {printingOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[240px]">
                      {item.title} (x{item.quantity})
                    </span>
                    <span className="font-mono">{item.total.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-[#C92127]">
                <span>TỔNG THU:</span>
                <span className="font-mono">{printingOrder.total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
