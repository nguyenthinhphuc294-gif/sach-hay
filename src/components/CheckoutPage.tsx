import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStore } from '../context/StoreContext';
import { getSession } from '../checkout/api';
import type { Failure, OrderRequest, OrderResult, PaymentMethod, QuoteRequest } from '../checkout/api';
import { fetchQuote, quoteKey, submitOrder } from '../checkout/store';
import type { CheckoutDispatch, CheckoutState } from '../checkout/store';
import { CheckoutVoucher } from './CheckoutVoucher';
import {
  ShieldCheck,
  Truck,
  Building,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface CheckoutPageProps {
  onOrderCompleted: (payment?: OrderResult['payment']) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderCompleted }) => {
  const {
    cart,
    selectedCartCount,
    recordCheckout,
    setActiveView
  } = useStore();

  const dispatch = useDispatch<CheckoutDispatch>();
  const checkout = useSelector((state: CheckoutState) => state.checkout);
  const selectedItems = useMemo(() => cart.filter(i => i.selected), [cart]);
  const items = useMemo(() => selectedItems.map(({ bookId, quantity }) => ({ bookId, quantity })), [selectedItems]);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string>();
  const [quoteRefresh, refreshQuote] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const attempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const submitting = useRef(false);
  const sessionChanged = useRef(false);
  const request = useMemo<QuoteRequest>(() => ({ items, paymentMethod, voucherCode }), [items, paymentMethod, voucherCode]);
  const isCurrentQuote = checkout.key === quoteKey(request);
  const quote = isCurrentQuote ? checkout.quote : null;
  const quoteError = isCurrentQuote ? checkout.quoteError : null;
  const isSubmitting = checkout.submitting;

  useEffect(() => {
    const controller = new AbortController();
    getSession(controller.signal).then(result => {
      if (!controller.signal.aborted && !sessionChanged.current) setSessionEmail(result.email);
    }).catch(() => { /* Guest checkout does not need an account. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!request.items.length) return;
    const action = dispatch(fetchQuote(request));
    return () => action.abort();
  }, [dispatch, request, quoteRefresh, sessionEmail]);

  const provinces = [
    'Thành phố Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Bình Dương',
    'Đồng Nai',
    'Khánh Hòa',
    'Lâm Đồng',
    'Thừa Thiên Huế'
  ];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || submitting.current) return;
    setErrorMessage('');

    const phoneClean = phone.replace(/\s+/g, '');
    if (!/^0\d{9}$/.test(phoneClean)) {
      setErrorMessage('Số điện thoại không hợp lệ (Vui lòng nhập 10 chữ số, bắt đầu bằng số 0)!');
      return;
    }

    submitting.current = true;
    try {
      const order: OrderRequest = {
        ...request, quoteVersion: quote.quoteVersion,
        customerName: customerName.trim(), phone: phoneClean, email: email.trim(),
        province, district, ward, address: address.trim(), notes: notes.trim(),
      };
      const fingerprint = JSON.stringify([sessionEmail, order]);
      if (attempt.current?.fingerprint !== fingerprint) {
        attempt.current = { fingerprint, key: window.crypto.randomUUID() };
      }
      const result = await dispatch(submitOrder({ order, key: attempt.current.key })).unwrap();
      recordCheckout(result);
      onOrderCompleted(result.payment);
    } catch (error) {
      const failure = error as Partial<Failure>;
      setErrorMessage(failure.message ?? 'Có lỗi khi gửi đơn. Vui lòng thử lại.');
      if (failure.code === 'VOUCHER_LOGIN_REQUIRED') setSessionEmail(null);
      if (failure.code && !['NETWORK', 'UNAVAILABLE', 'SERVER_ERROR'].includes(failure.code)) refreshQuote(value => value + 1);
    } finally {
      submitting.current = false;
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Không có sản phẩm nào được chọn để thanh toán.</p>
        <button
          onClick={() => setActiveView('cart')}
          className="px-4 py-2 bg-[#C92127] text-white rounded-lg text-xs font-bold"
        >
          Quay lại giỏ hàng
        </button>
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
        <button
          onClick={() => setActiveView('cart')}
          className="hover:text-[#C92127] transition-colors"
        >
          Giỏ hàng
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Thanh toán & Đặt hàng</span>
      </nav>

      <CheckoutVoucher email={sessionEmail} onSession={value => {
        sessionChanged.current = true;
        setSessionEmail(value);
        if (value) setEmail(current => current || value);
      }} appliedCode={quote?.voucherCode} disabled={isSubmitting} onApply={code => {
        setErrorMessage('');
        setVoucherCode(code);
        refreshQuote(value => value + 1);
      }} onRemove={() => { setErrorMessage(''); setVoucherCode(undefined); }} />

      <form method="post" onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: SHIPPING & PAYMENT FORM (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Information Card */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>1. Thông Tin Nhận Hàng</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Vui lòng kiểm tra kỹ thông tin
                </span>
              </h3>

              {errorMessage && (
                <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Số điện thoại nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Email (để nhận mã tra cứu hóa đơn) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-province" className="block text-slate-700 font-bold mb-1">Tỉnh / Thành phố</label>
                  <select
                    id="checkout-province"
                    value={province}
                    required={paymentMethod !== 'STORE_PICKUP'}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="checkout-district" className="block text-slate-700 font-bold mb-1">Quận / Huyện</label>
                  <input
                    id="checkout-district"
                    type="text"
                    required={paymentMethod !== 'STORE_PICKUP'}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-ward" className="block text-slate-700 font-bold mb-1">Phường / Xã</label>
                  <input
                    id="checkout-ward"
                    type="text"
                    required={paymentMethod !== 'STORE_PICKUP'}
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Địa chỉ nhà cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={paymentMethod !== 'STORE_PICKUP'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số 45 Đường Lê Lợi, Tòa nhà Bitexco..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    Ghi chú giao hàng (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi điện trước khi giao 15 phút..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4">
                2. Phương Thức Thanh Toán
              </h3>

              <div className="space-y-3">
                {(checkout.quote?.bankTransferAvailable || paymentMethod === 'BANK_TRANSFER') && (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#C92127] bg-red-50/40' : 'border-slate-200'}`}>
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')} className="mt-1 h-4 w-4 accent-[#C92127]" />
                    <div className="flex-1 text-xs">
                      <span className="text-sm font-bold text-slate-900">Chuyển khoản ngân hàng qua VietQR</span>
                      <p className="mt-1 text-slate-600">Quét mã Woori Bank sau khi đặt hàng. Sách Hay tự kiểm tra khi nhận được tiền.</p>
                    </div>
                  </label>
                )}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#C92127] bg-red-50/40 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-4 h-4 accent-[#C92127] mt-1"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Truck className="w-4 h-4 text-[#C92127]" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Bạn thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được
                      sách. Kiểm tra sách trước khi thanh toán.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'STORE_PICKUP'
                      ? 'border-[#C92127] bg-red-50/40 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'STORE_PICKUP'}
                    onChange={() => setPaymentMethod('STORE_PICKUP')}
                    className="w-4 h-4 accent-[#C92127] mt-1"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Building className="w-4 h-4 text-[#C92127]" />
                      <span>Nhận trực tiếp tại Nhà Sách Sách Hay</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Miễn phí vận chuyển. Nhận sách và thanh toán tại chi nhánh Sách Hay Quận 1, TP.
                      Hồ Chí Minh trong vòng 48h sau khi đơn được xác nhận.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER ITEMS RECAP & SUBMISSION (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm space-y-4 sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Đơn Hàng ({selectedCartCount} sản phẩm)</span>
                <button
                  type="button"
                  onClick={() => setActiveView('cart')}
                  className="text-xs text-[#C92127] hover:underline font-normal flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Sửa giỏ
                </button>
              </h3>

              {/* Itemized List */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <div key={item.bookId} className="pt-2.5 first:pt-0 flex items-center gap-3 text-xs">
                    <img
                      src={item.book.coverImage}
                      alt={item.book.title}
                      className="w-12 h-16 object-cover rounded border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.book.title}</h4>
                      <p className="text-slate-500 text-[11px]">SL: {item.quantity}</p>
                      <span className="font-bold text-[#C92127] font-mono tabular-nums">
                        {quote?.lines.find(line => line.bookId === item.bookId)?.total.toLocaleString('vi-VN') ?? '—'} ₫
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Financials */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính sách:</span>
                  <span className="font-mono tabular-nums text-slate-800 font-semibold">
                    {quote?.subtotal.toLocaleString('vi-VN') ?? '—'} ₫
                  </span>
                </div>

                {quote && quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Khuyến mãi ({quote.voucherCode}):</span>
                    <span className="font-mono tabular-nums">
                      -{quote.discount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-mono tabular-nums text-slate-800 font-semibold">
                    {quote?.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">0đ (Miễn phí)</span>
                    ) : (
                      `${quote?.shippingFee.toLocaleString('vi-VN') ?? '—'} ₫`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-[#C92127] font-mono tabular-nums">
                    {quote?.total.toLocaleString('vi-VN') ?? '—'} ₫
                  </span>
                </div>
              </div>

              {quoteError ? (
                <div className="text-xs text-red-700" role="alert">
                  <p>{quoteError.message}</p>
                  <button type="button" className="mr-3 font-semibold underline" onClick={() => refreshQuote(value => value + 1)}>Tính lại</button>
                  {voucherCode && <button type="button" className="font-semibold underline" onClick={() => setVoucherCode(undefined)}>Bỏ voucher</button>}
                </div>
              ) : !quote && <p role="status" className="text-xs text-slate-600">Đang tính tổng tiền…</p>}

              <button
                type="submit"
                disabled={isSubmitting || !quote}
                className="w-full py-3.5 px-4 bg-[#C92127] hover:bg-[#A5181E] disabled:bg-slate-400 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xác thực tồn kho & lập đơn...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Xác Nhận Đặt Hàng Ngay</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Giao dịch an toàn · Bảo mật thông tin tuyệt đối</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
