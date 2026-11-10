import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  Package,
  Copy,
  ChevronRight,
  ShoppingBag,
  Clock,
  Truck
} from 'lucide-react';

interface OrderSuccessModalProps {
  onClose: () => void;
  onTrackOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ onClose, onTrackOrder }) => {
  const { lastCreatedOrder, showToast, setActiveView } = useStore();

  if (!lastCreatedOrder) return null;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lastCreatedOrder.orderCode);
      showToast('Đã sao chép mã đơn hàng vào bộ nhớ tạm!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 my-8">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
          Đặt Hàng Thành Công!
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Cảm ơn bạn đã mua sách tại Sách Hay. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
        </p>

        {/* Order Code Callout */}
        <div className="my-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Mã đơn hàng của bạn:</span>
            <strong className="text-base font-mono font-black text-[#C92127]">
              {lastCreatedOrder.orderCode}
            </strong>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-100 rounded-lg text-xs font-bold text-[#C92127] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </button>
        </div>

        {/* Order Details Brief */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-xs border border-slate-200 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Người nhận:</span>
            <span className="font-bold text-slate-800">{lastCreatedOrder.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Số điện thoại:</span>
            <span className="font-mono text-slate-800">{lastCreatedOrder.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Địa chỉ giao:</span>
            <span className="font-medium text-slate-800 text-right max-w-xs truncate">
              {lastCreatedOrder.address}, {lastCreatedOrder.ward}, {lastCreatedOrder.province}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Hình thức thanh toán:</span>
            <span className="font-bold text-[#C92127]">
              {lastCreatedOrder.paymentMethod === 'COD'
                ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                : 'Nhận tại cửa hàng Sách Hay'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="font-bold text-slate-700">Tổng thanh toán:</span>
            <span className="text-base font-black text-[#C92127] font-mono">
              {lastCreatedOrder.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5">
          <button
            onClick={onTrackOrder}
            className="w-full py-3 bg-[#C92127] hover:bg-[#A5181E] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Xem Chi Tiết & Theo Dõi Tiến Độ Đơn</span>
          </button>

          <button
            onClick={() => {
              onClose();
              setActiveView('home');
            }}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tiếp tục mua sách khác
          </button>
        </div>
      </div>
    </div>
  );
};
