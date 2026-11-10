import { useEffect, useRef, useState } from 'react';
import { checkoutFailure, getOrderPayment } from '../checkout/api';
import type { BankPayment, PaymentReceipt } from '../checkout/api';

const receiptKey = 'sachhay:bank-payment';

export function readPaymentReceipt(): PaymentReceipt | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(receiptKey) ?? 'null');
    if (typeof value?.orderCode === 'string' && /^SACHHAY[A-F0-9]{16}$/.test(value.orderCode)
      && typeof value.token === 'string' && /^[a-f0-9]{64}$/.test(value.token)) {
      return { orderCode: value.orderCode, token: value.token };
    }
  } catch {
    // In-memory payment still works when the browser blocks session storage.
  }
  return null;
}

export function savePaymentReceipt(receipt: PaymentReceipt | null) {
  try {
    if (receipt) sessionStorage.setItem(receiptKey, JSON.stringify(receipt));
    else sessionStorage.removeItem(receiptKey);
  } catch {
    // The current tab can still complete the payment without persistence.
  }
}

type Props = {
  receipt: PaymentReceipt;
  initialPayment?: BankPayment;
  onDismiss: (finished: boolean) => void;
};

const vnd = (amount: number) => amount.toLocaleString('vi-VN') + ' ₫';

export function BankTransferPayment({ receipt, initialPayment, onDismiss }: Props) {
  const [payment, setPayment] = useState(initialPayment);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const { orderCode, token } = receipt;
  const paid = payment?.status === 'paid';

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (initialPayment?.status === 'paid') return;
    const controller = new AbortController();
    let timer: number | undefined;

    async function poll() {
      let delay = 5000;
      try {
        const result = await getOrderPayment({ orderCode, token }, controller.signal);
        if (controller.signal.aborted) return;
        setPayment(result);
        setError('');
        if (result.status === 'paid') return;
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (checkoutFailure(failure).code === 'PAYMENT_NOT_FOUND') {
          setUnavailable(true);
          setError('Phiên thanh toán không còn truy cập được.');
          return;
        }
        setError('Chưa kiểm tra được trạng thái. Hệ thống sẽ tự thử lại.');
        delay = 10000;
      }
      timer = window.setTimeout(poll, delay);
    }

    void poll();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [orderCode, token, initialPayment?.status]);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage('Đã sao chép.');
    } catch {
      setCopyMessage('Hãy chọn và sao chép thông tin trực tiếp.');
    }
  }

  return (
    <dialog ref={dialog} aria-labelledby="vietqr-payment-title"
      onCancel={event => { event.preventDefault(); onDismiss(paid || unavailable); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,560px)] overflow-auto rounded-2xl bg-white p-5 shadow-2xl backdrop:bg-black/60 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="vietqr-payment-title" className="text-xl font-black text-slate-900">Chuyển khoản VietQR</h2>
          <p className="mt-1 text-sm text-slate-600">Đơn hàng <strong>{orderCode}</strong></p>
        </div>
        <button type="button" onClick={() => onDismiss(paid || unavailable)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Đóng</button>
      </div>

      <p role="status" className={`mt-4 rounded-xl p-3 text-sm font-semibold ${paid ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
        {paid ? 'Đã thanh toán' : unavailable ? 'Phiên thanh toán không khả dụng' : 'Đang chờ thanh toán tự động...'}
        {paid && payment?.paidAt && (
          <span className="mt-1 block font-normal">
            {new Date(payment.paidAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </span>
        )}
      </p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}

      {payment && !unavailable && (
        <>
          {!paid && payment.qrUrl && !imageFailed && (
            <img src={payment.qrUrl} alt="Mã VietQR để chuyển khoản cho đơn hàng"
              className="mx-auto my-4 w-56 rounded-xl border border-slate-100"
              referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
          )}
          {imageFailed && !paid && <p className="my-3 text-sm text-slate-600">Ảnh QR đang không tải được. Bạn có thể nhập thông tin dưới đây trong ứng dụng ngân hàng.</p>}
          <dl className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-1"><dt>Ngân hàng</dt><dd className="font-bold">{payment.bankName}</dd></div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <dt>Số tài khoản</dt>
              <dd className="font-mono font-bold">{payment.accountNumber}{!paid && (
                <button type="button" className="ml-2 text-xs text-red-700 underline" onClick={() => void copy(payment.accountNumber)}>Sao chép số tài khoản</button>
              )}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-1"><dt>Chủ tài khoản</dt><dd className="font-bold">{payment.accountName}</dd></div>
            <div className="flex flex-wrap justify-between gap-1"><dt>{paid ? 'Số tiền đã thanh toán' : 'Số tiền cần chuyển'}</dt><dd className="font-bold text-[#C92127]">{vnd(payment.amount)}</dd></div>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <dt>Nội dung chuyển khoản</dt>
              <dd className="break-all font-mono font-bold">{orderCode}{!paid && (
                <button type="button" className="ml-2 text-xs text-red-700 underline" onClick={() => void copy(orderCode)}>Sao chép nội dung</button>
              )}</dd>
            </div>
          </dl>
          {!paid && <p className="mt-3 text-xs text-slate-600">Chuyển đúng số tiền và giữ nguyên mã đơn trong nội dung để hệ thống xác nhận tự động.</p>}
          {copyMessage && <p role="status" className="mt-2 text-xs text-slate-600">{copyMessage}</p>}
        </>
      )}
    </dialog>
  );
}
