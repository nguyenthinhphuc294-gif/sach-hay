import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  AlertTriangle,
  XCircle,
  Copy,
  Building
} from 'lucide-react';

interface OrderTrackingModalProps {
  initialOrderCode?: string;
  initialPhone?: string;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  initialOrderCode = '',
  initialPhone = '',
  onClose
}) => {
  const { lookupOrder, cancelOrder, showToast, orders } = useStore();

  const [orderCodeInput, setOrderCodeInput] = useState(initialOrderCode);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() =>
    initialOrderCode && initialPhone ? lookupOrder(initialOrderCode, initialPhone) : null
  );
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedOrder(null);
    if (!orderCodeInput.trim()) {
      setSearchError('Vui lòng nhập mã đơn hàng!');
      return;
    }
    if (!phoneInput.trim()) {
      setSearchError('Vui lòng nhập số điện thoại đặt hàng!');
      return;
    }

    const found = lookupOrder(orderCodeInput, phoneInput);
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchError('Không tìm thấy đơn hàng với thông tin đã nhập. Vui lòng kiểm tra lại!');
    }
  };

  const handleCancelThisOrder = (orderId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Số lượng sách sẽ được hoàn lại kho.')) {
      const ok = cancelOrder(orderId, 'Khách hàng hủy đơn qua hệ thống tra cứu');
      if (ok) {
        // Refresh local view
        const updated = orders.find((o) => o.id === orderId);
        if (updated) setSearchedOrder({ ...updated, status: 'cancelled' });
      }
    }
  };

  const copyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      showToast('Đã sao chép mã đơn hàng!', 'info');
    }
  };

  const statusSteps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'processing', label: 'Đang chuẩn bị' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Truck className="w-5 h-5 text-[#C92127]" />
            <span>Tra Cứu Tiến Độ Đơn Hàng</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng tra cứu đơn hàng"
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="tracking-order-code" className="block text-slate-700 font-bold mb-1">Mã đơn hàng:</label>
              <input
                id="tracking-order-code"
                type="text"
                value={orderCodeInput}
                onChange={(e) => setOrderCodeInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              />
            </div>
            <div>
              <label htmlFor="tracking-phone" className="block text-slate-700 font-bold mb-1">Số điện thoại đặt hàng:</label>
              <input
                id="tracking-phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tra cứu ngay</span>
            </button>
          </div>

          {searchError && (
            <p className="mt-2 text-xs text-red-600 font-medium">{searchError}</p>
          )}
        </form>

        {/* Searched Order Details */}
        {searchedOrder && (
          <div className="mt-6 space-y-5 animate-in fade-in">
            {/* Order Code & Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-red-50/70 border border-red-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Mã đơn hàng:</span>
                  <strong className="text-base font-black font-mono text-[#C92127]">
                    {searchedOrder.orderCode}
                  </strong>
                  <button
                    onClick={() => copyCode(searchedOrder.orderCode)}
                    className="text-slate-400 hover:text-slate-700"
                    title="Sao chép"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  Đặt lúc: {new Date(searchedOrder.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div>
                {searchedOrder.status === 'cancelled' ? (
                  <span className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Đã Hủy
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {statusSteps.find((s) => s.key === searchedOrder.status)?.label ||
                      searchedOrder.status}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Status Stepper */}
            {searchedOrder.status !== 'cancelled' ? (
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#C92127] transition-all duration-500 z-0"
                    style={{
                      width: `${(getStepIndex(searchedOrder.status) / (statusSteps.length - 1)) * 100}%`
                    }}
                  ></div>

                  {statusSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(searchedOrder.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isPassed
                              ? 'bg-[#C92127] text-white shadow-sm ring-4 ring-red-100'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs mt-1.5 whitespace-nowrap ${
                            isPassed ? 'font-bold text-[#C92127]' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-100/60 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  Đơn hàng này đã bị hủy. Hàng đã được giải phóng và hoàn lại tồn kho Sách Hay.
                </span>
              </div>
            )}

            {/* Timeline Log */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Nhật Ký Hành Trình
              </h4>
              <div className="space-y-2">
                {searchedOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#C92127] mt-1.5 shrink-0"></span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{h.note}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{h.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipient & Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-700 block mb-1">Người nhận:</span>
                <p className="font-semibold text-slate-900">{searchedOrder.customerName}</p>
                <p className="text-slate-500 font-mono">{searchedOrder.phone}</p>
                <p className="text-slate-600 mt-1">
                  {searchedOrder.address}, {searchedOrder.ward}, {searchedOrder.district},{' '}
                  {searchedOrder.province}
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Thanh toán:</span>
                  <p className="font-semibold text-[#C92127]">
                    {searchedOrder.paymentMethod === 'COD'
                      ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                      : searchedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản VietQR' : 'Nhận tại cửa hàng Sách Hay'}
                  </p>
                  <p className="text-slate-500 mt-1">
                    Tổng tiền: <strong className="text-slate-900 font-mono">{searchedOrder.total.toLocaleString('vi-VN')}đ</strong>
                  </p>
                </div>

                {/* Cancel action if eligible */}
                {searchedOrder.source !== 'checkout-api' && (searchedOrder.status === 'pending' || searchedOrder.status === 'confirmed') && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCancelThisOrder(searchedOrder.id)}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Hủy đơn hàng này
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="p-2.5 bg-slate-100 font-bold text-slate-700">
                Sản phẩm trong đơn ({searchedOrder.items.length})
              </div>
              <div className="divide-y divide-slate-100">
                {searchedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-8 h-11 object-cover rounded border border-slate-200 shrink-0"
                      />
                      <span className="font-medium text-slate-800 truncate">{item.title}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-slate-700">
                        {item.quantity} x {item.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="block font-bold text-[#C92127] font-mono">
                        {item.total.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
