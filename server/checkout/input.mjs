import { z } from 'zod';

export class CheckoutError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const item = z.object({
  bookId: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  quantity: z.number().int().min(1).max(99),
});
const address = z.string().trim().max(150).default('');
const email = z.string().trim().toLowerCase().max(200).pipe(z.email());
export const quoteInput = z.object({
  items: z.array(item).min(1).max(30),
  voucherCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{1,40}$/).optional(),
  paymentMethod: z.enum(['COD', 'STORE_PICKUP', 'BANK_TRANSFER']),
});

export const orderInput = quoteInput.extend({
  quoteVersion: z.string().regex(/^[a-f0-9]{64}$/),
  customerName: z.string().trim().min(1).max(100),
  phone: z.string().regex(/^0\d{9}$/),
  email,
  province: address,
  district: address,
  ward: address,
  address: address,
  notes: z.string().trim().max(400).default(''),
}).refine(input => input.paymentMethod === 'STORE_PICKUP' ||
  Boolean(input.province && input.district && input.ward && input.address), {
    message: 'Vui lòng điền đầy đủ địa chỉ giao hàng.',
  });

export const authInput = z.object({ email, password: z.string().min(10).max(128) });

export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues.find(issue => issue.code === 'custom')?.message;
    throw new CheckoutError(400, 'INVALID_INPUT', message ?? 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra và thử lại.');
  }
  return result.data;
}

export function normalizedItems(items) {
  const quantities = new Map();
  for (const { bookId, quantity } of items) {
    const total = (quantities.get(bookId) ?? 0) + quantity;
    if (total > 99) throw new CheckoutError(400, 'INVALID_QUANTITY', 'Mỗi tựa sách chỉ được đặt tối đa 99 cuốn.');
    quantities.set(bookId, total);
  }
  return [...quantities].sort(([a], [b]) => a.localeCompare(b)).map(([bookId, quantity]) => ({ bookId, quantity }));
}
