import type { Order, OrderItem } from '../types';

export type PaymentMethod = Order['paymentMethod'];
export type CheckoutItem = { bookId: string; quantity: number };
export type QuoteRequest = { items: CheckoutItem[]; paymentMethod: PaymentMethod; voucherCode?: string };
export type Quote = {
  lines: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  quoteVersion: string;
  bankTransferAvailable: boolean;
};
export type OrderRequest = QuoteRequest & {
  quoteVersion: string;
  customerName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  notes: string;
};
export type Inventory = { bookId: string; stock: number; soldCount: number };
export type PaymentReceipt = { orderCode: string; token: string };
export type BankPayment = {
  orderCode: string;
  status: 'pending' | 'paid';
  paidAt?: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrUrl: string | null;
};
export type OrderResult = { order: Order; inventory: Inventory[]; payment?: BankPayment & PaymentReceipt };
export type Failure = { code: string; message: string };

class CheckoutApiError extends Error {
  constructor(readonly code: string, message: string) { super(message); }
}

async function call<T>(path: string, options: { body?: object; signal?: AbortSignal; headers?: HeadersInit } = {}): Promise<T> {
  const { body, signal } = options;
  const headers = new Headers(options.headers);
  if (body) {
    headers.set('Content-Type', 'application/json');
    headers.set('X-SachHay-Request', '1');
  }
  const response = await fetch('/api/checkout' + path, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (response.status === 204) return undefined as T;
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    throw new CheckoutApiError('UNAVAILABLE', 'Máy chủ thanh toán chưa sẵn sàng. Vui lòng thử lại.');
  }
  const data = await response.json();
  if (!response.ok) throw new CheckoutApiError(data.code, data.message);
  return data as T;
}

export const getQuote = (body: QuoteRequest, signal: AbortSignal) => call<Quote>('/quote', { body, signal });
export const postOrder = (body: OrderRequest, key: string, signal: AbortSignal) =>
  call<OrderResult>('/orders', { body, signal, headers: { 'Idempotency-Key': key } });
export const getOrderPayment = ({ orderCode, token }: PaymentReceipt, signal: AbortSignal) =>
  call<BankPayment>(`/orders/${encodeURIComponent(orderCode)}/payment`, {
    signal, headers: { 'X-SachHay-Payment-Token': token },
  });
export const getSession = (signal?: AbortSignal) => call<{ email: string | null }>('/session', { signal });
export const signIn = (action: 'login' | 'register', email: string, password: string) =>
  call<{ email: string }>('/session/' + action, { body: { email, password } });
export const signOut = () => call<void>('/session/logout', { body: {} });

export function checkoutFailure(error: unknown): Failure {
  return error instanceof CheckoutApiError
    ? { code: error.code, message: error.message }
    : { code: 'NETWORK', message: 'Chưa nhận được phản hồi từ hệ thống. Vui lòng thử lại.' };
}
