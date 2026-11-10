import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Settings,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { OrderStatus } from '../types';

export const AccountPage: React.FC = () => {
  const {
    currentUser,
    orders,
    books,
    wishlist,
    cancelOrder,
    openBookDetail,
    addToCart,
    setActiveView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'addresses'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const wishlistBooks = books.filter((b) => wishlist.includes(b.id));

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Đang chuẩn bị</span>;
      case 'shipping':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Đang giao hàng</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">Đã hủy</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <button
          onClick={() => setActiveView('home')}
          className="hover:text-[#C92127] transition-colors"
        >
          Trang chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Tài khoản & Đơn hàng của tôi</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR: PROFILE CARD & NAVIGATION (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-xs">
            {/* User Avatar & Name */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#C92127] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {currentUser?.name.charAt(0) || <UserIcon className="w-5 h-5" aria-hidden="true" />}
              </div>
              <div className="flex-1 min-w-0">
                {currentUser && (
                  <>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">{currentUser.phone}</p>
                  </>
                )}
                <span className="inline-block mt-1 text-[10px] font-semibold bg-red-100 text-[#C92127] px-2 py-0.5 rounded">
                  {currentUser?.role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Chưa đăng nhập'}
                </span>
              </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="mt-4 space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-red-50 text-[#C92127]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Đơn hàng của tôi</span>
                </div>
                <span className="font-mono text-[11px] font-bold">({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'wishlist'
                    ? 'bg-red-50 text-[#C92127]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  <span>Sách yêu thích</span>
                </div>
                <span className="font-mono text-[11px] font-bold">({wishlist.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-red-50 text-[#C92127]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-red-50 text-[#C92127]'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Sổ địa chỉ nhận hàng</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setActiveView('admin')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-bold text-[#C92127] bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cổng Quản Trị Hệ Thống</span>
                </button>
              )}
            </div>

          </div>
        </aside>

        {/* RIGHT MAIN CONTENT (8 cols) */}
        <main className="lg:col-span-8">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order status filters */}
              <div className="bg-white rounded-xl p-3 border border-[#E5E5E5] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tất cả đơn' },
                  { id: 'pending', label: 'Chờ xác nhận' },
                  { id: 'confirmed', label: 'Đã xác nhận' },
                  { id: 'shipping', label: 'Đang giao' },
                  { id: 'completed', label: 'Hoàn thành' },
                  { id: 'cancelled', label: 'Đã hủy' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrderFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      orderFilter === st.id
                        ? 'bg-[#C92127] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Order Cards */}
              {filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Mã đơn:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {order.orderCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate">{item.title}</h4>
                              <p className="text-[11px] text-slate-500">
                                Số lượng: {item.quantity} cuốn
                              </p>
                            </div>
                            <span className="font-bold text-slate-900 font-mono">
                              {item.total.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer: Total & Actions */}
                      <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Tổng thanh toán: </span>
                          <strong className="text-sm font-black text-[#C92127] font-mono">
                            {order.total.toLocaleString('vi-VN')}đ
                          </strong>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({order.paymentMethod === 'BANK_TRANSFER' ? 'VietQR' : order.paymentMethod === 'COD' ? 'COD' : 'Nhận tại cửa hàng'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.source !== 'checkout-api' && (order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => {
                                if (window.confirm('Bạn có muốn hủy đơn hàng này không?')) {
                                  cancelOrder(order.id);
                                }
                              }}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-xs"
                            >
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-[#E5E5E5]">
                  <p className="text-xs text-slate-500">Chưa có đơn hàng nào trong mục này.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                Sách Bạn Đã Yêu Thích ({wishlistBooks.length})
              </h3>
              {wishlistBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {wishlistBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500">
                  Bạn chưa lưu cuốn sách nào vào danh sách yêu thích.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            <div key={currentUser?.id ?? 'guest'} className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Hồ Sơ Cá Nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="profile-name" className="block text-slate-600 font-bold mb-1">Họ và tên:</label>
                  <input
                    id="profile-name"
                    type="text"
                    defaultValue={currentUser?.name ?? ''}
                    disabled={!currentUser}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-slate-600 font-bold mb-1">Email đăng ký:</label>
                  <input
                    id="profile-email"
                    type="email"
                    defaultValue={currentUser?.email ?? ''}
                    disabled={!currentUser}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="block text-slate-600 font-bold mb-1">Số điện thoại:</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    defaultValue={currentUser?.phone ?? ''}
                    disabled={!currentUser}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Mật khẩu:</label>
                  <input
                    type="password"
                    defaultValue={currentUser ? '********' : ''}
                    disabled
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-400"
                  />
                </div>
              </div>
              {currentUser && (
                <button className="px-5 py-2.5 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E] transition-colors">
                  Lưu Thay Đổi
                </button>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Sổ Địa Chỉ Giao Hàng
                </h3>
                {currentUser && (
                  <button className="text-xs text-[#C92127] font-bold hover:underline">
                    + Thêm địa chỉ mới
                  </button>
                )}
              </div>

              {!currentUser && <p className="text-xs text-slate-500">Chưa đăng nhập.</p>}
              {currentUser?.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-red-200 bg-red-50/20 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{addr.recipientName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold bg-[#C92127] text-white px-2 py-0.5 rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 font-mono">{addr.phone}</p>
                  <p className="text-slate-700">
                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
