import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    toggleCartSelect,
    toggleSelectAll,
    cartSubtotal,
    cartShipping,
    cartTotal,
    selectedCartCount,
    checkoutSelectedItems,
    setActiveView,
    openBookDetail
  } = useStore();

  const allSelected = cart.length > 0 && cart.every((item) => item.selected);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-12 border border-[#E5E5E5] max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-red-50 text-[#C92127] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-slate-500 mb-6">
            Hãy khám phá hàng ngàn tựa sách hấp dẫn tại Sách Hay và chọn cho mình cuốn sách yêu thích
            nhé!
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-6 py-2.5 bg-[#C92127] hover:bg-[#A5181E] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Tiếp tục mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

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
        <span className="text-slate-900 font-bold">Giỏ hàng ({cart.length} sản phẩm)</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: CART ITEMS LIST (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Controls: Select All */}
          <div className="bg-white rounded-xl p-3.5 border border-[#E5E5E5] flex items-center justify-between shadow-xs">
            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-[#C92127] rounded"
              />
              <span>Chọn tất cả ({cart.length} sản phẩm)</span>
            </label>

            <span className="text-xs text-slate-500 hidden sm:block">Đơn giá / Số lượng</span>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-xs divide-y divide-slate-100 overflow-hidden">
            {cart.map((item) => (
              <div
                key={item.bookId}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  item.selected ? 'bg-white' : 'bg-slate-50/50 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3 w-full sm:w-auto flex-1">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleCartSelect(item.bookId)}
                    className="w-4 h-4 accent-[#C92127] rounded mt-2 sm:mt-0 shrink-0"
                  />

                  {/* Book cover */}
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    onClick={() => openBookDetail(item.book)}
                    className="w-16 h-22 object-cover rounded-md border border-slate-200 cursor-pointer shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      onClick={() => openBookDetail(item.book)}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#C92127] cursor-pointer line-clamp-2"
                    >
                      {item.book.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {item.book.author} · {item.book.categoryName}
                    </p>

                    <div className="flex items-baseline gap-2 mt-1 sm:hidden">
                      <span className="text-xs font-bold text-[#C92127] font-mono">
                        {item.book.price.toLocaleString('vi-VN')}đ
                      </span>
                      {item.book.originalPrice > item.book.price && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          {item.book.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    {item.book.stock <= 5 && item.book.stock > 0 && (
                      <span className="text-[10px] text-amber-600 block mt-1 font-medium">
                        Chỉ còn {item.book.stock} cuốn trong kho!
                      </span>
                    )}
                  </div>
                </div>

                {/* Right controls: Price, Stepper, Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Price (Desktop) */}
                  <div className="text-right hidden sm:block">
                    <span className="text-sm font-bold text-[#C92127] font-mono block">
                      {(item.book.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.book.price.toLocaleString('vi-VN')}đ / cuốn
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.bookId, -1)}
                      className="p-1.5 hover:bg-slate-200 rounded-l-lg transition-colors text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.bookId, 1)}
                      disabled={item.quantity >= item.book.stock}
                      className="p-1.5 hover:bg-slate-200 rounded-r-lg transition-colors text-slate-600 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.bookId)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: PROMOTIONS & SUMMARY (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Voucher Box */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <Tag className="w-4 h-4 text-[#C92127]" />
              <span>Mã Giảm Giá & Khuyến Mãi</span>
            </div>

            <p className="text-xs text-slate-600">Bạn có thể nhập voucher ở bước thanh toán.</p>
          </div>

          {/* Order Summary Box */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Tóm Tắt Đơn Hàng
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính ({selectedCartCount} sản phẩm):</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">
                  {cartSubtotal.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-slate-800 font-mono tabular-nums">
                  {cartShipping === 0 ? (
                    <span className="text-emerald-600 font-bold">Miễn phí (Toàn quốc)</span>
                  ) : (
                    `${cartShipping.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Tổng dự kiến:</span>
                <span className="text-xl font-black text-[#C92127] font-mono tabular-nums">
                  {cartTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 text-right">(Đã bao gồm VAT nếu có)</p>
            </div>

            <button
              onClick={checkoutSelectedItems}
              disabled={selectedCartCount === 0}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer ${
                selectedCartCount === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#C92127] hover:bg-[#A5181E] active:scale-95'
              }`}
            >
              <span>Tiến hành đặt hàng ({selectedCartCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảo mật đơn hàng 100% · Hỗ trợ COD tận nơi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
