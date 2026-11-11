import { createHash, randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { CheckoutError, normalizedItems } from './input.mjs';
import { Order, StockBook, Voucher, VoucherUse } from './models.mjs';
import { bankPaymentDetails, bankTransferConfig, paymentAccessToken } from './bank-payment.mjs';
import { FREE_SHIPPING_MINIMUM, STANDARD_SHIPPING_FEE } from '../../shared/delivery.mjs';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const conflict = (code, message) => new CheckoutError(409, code, message);

export async function quote(input, customer, session) {
  const items = normalizedItems(input.items);
  const books = await StockBook.find({ _id: { $in: items.map(item => item.bookId) }, active: true }).session(session ?? null).lean();
  const byId = new Map(books.map(book => [book._id, book]));
  const lines = items.map(({ bookId, quantity }) => {
    const book = byId.get(bookId);
    if (!book) throw new CheckoutError(404, 'BOOK_NOT_FOUND', 'Giỏ có sách chưa được bán hoặc chưa đồng bộ với hệ thống.');
    if (book.stock < quantity) throw conflict('OUT_OF_STOCK', `Sách “${book.title}” chỉ còn ${book.stock} cuốn.`);
    return { bookId, quantity, title: book.title, coverImage: book.coverImage, price: book.price, total: book.price * quantity };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  let shippingFee = input.paymentMethod === 'STORE_PICKUP' || subtotal >= FREE_SHIPPING_MINIMUM ? 0 : STANDARD_SHIPPING_FEE;
  let discount = 0;
  let voucher;
  if (input.voucherCode) {
    if (!customer) throw new CheckoutError(401, 'VOUCHER_LOGIN_REQUIRED', 'Đăng nhập tài khoản khách hàng để dùng voucher.');
    const now = new Date();
    voucher = await Voucher.findOne({ code: input.voucherCode, active: true, validFrom: { $lte: now }, validUntil: { $gt: now } })
      .session(session ?? null).lean();
    if (!voucher) throw new CheckoutError(404, 'VOUCHER_NOT_FOUND', 'Mã voucher không tồn tại hoặc đã hết hạn.');
    if (subtotal < voucher.minimum) {
      throw new CheckoutError(400, 'MINIMUM_NOT_MET', `Voucher áp dụng cho đơn từ ${voucher.minimum.toLocaleString('vi-VN')} ₫.`);
    }
    if (voucher.maxUses != null && voucher.used >= voucher.maxUses) {
      throw conflict('VOUCHER_EXHAUSTED', 'Voucher đã hết lượt sử dụng.');
    }
    const usage = await VoucherUse.findOne({ voucher: voucher._id, customer }).session(session ?? null).lean();
    if ((usage?.count ?? 0) >= voucher.maxPerUser) {
      throw conflict('VOUCHER_USER_LIMIT', 'Tài khoản của bạn đã dùng hết lượt cho voucher này.');
    }
    if (voucher.kind === 'shipping') {
      if (shippingFee === 0) throw new CheckoutError(400, 'NO_SHIPPING_FEE', 'Đơn này đã được miễn phí giao hàng.');
      shippingFee -= Math.min(shippingFee, voucher.value, voucher.cap ?? Infinity);
    } else {
      const reduction = voucher.kind === 'percentage' ? Math.floor(subtotal * voucher.value / 100) : voucher.value;
      discount = Math.min(subtotal, reduction, voucher.cap ?? Infinity);
    }
  }
  const total = subtotal - discount + shippingFee;
  const bankTransfer = input.paymentMethod === 'BANK_TRANSFER' ? bankTransferConfig() : undefined;
  if (input.paymentMethod === 'BANK_TRANSFER' && !bankTransfer) {
    throw new CheckoutError(503, 'BANK_TRANSFER_DISABLED', 'Chuyển khoản VietQR chưa được cấu hình.');
  }
  if (bankTransfer && total <= 0) {
    throw new CheckoutError(400, 'NO_TRANSFER_NEEDED', 'Đơn hàng không phát sinh khoản cần chuyển. Vui lòng chọn cách thanh toán khác.');
  }
  const voucherCode = voucher?.code;
  const quoteVersion = digest([lines.map(({ bookId, quantity, price }) => [bookId, quantity, price]),
    voucherCode, discount, shippingFee, input.paymentMethod]);
  return { lines, subtotal, discount, shippingFee, total, voucherCode, quoteVersion, voucher, bankTransfer };
}

function replay(order, customer, requestHash) {
  if (String(order.customer ?? '') !== String(customer ?? '') || order.requestHash !== requestHash) {
    throw conflict('ORDER_KEY_REUSED', 'Mã gửi đơn đã được dùng cho yêu cầu khác.');
  }
  return { order, created: false };
}

export async function placeOrder(input, customer, requestKey) {
  const requestHash = digest({ ...input, items: normalizedItems(input.items) });
  try {
    return await mongoose.connection.transaction(async session => {
      const existing = await Order.findOne({ requestKey }).session(session).lean();
      if (existing) return replay(existing, customer, requestHash);

      const priced = await quote(input, customer, session);
      if (priced.quoteVersion !== input.quoteVersion) {
        throw conflict('QUOTE_CHANGED', 'Giá hoặc phí giao hàng đã thay đổi. Hãy kiểm tra lại tổng tiền rồi đặt lại.');
      }

      // Lock the voucher document by writing it first. Concurrent uses of the same voucher
      // retry the transaction and recheck both counters against the winning write.
      if (priced.voucher) {
        const v = priced.voucher;
        const condition = { _id: v._id, active: true, validUntil: { $gt: new Date() } };
        if (v.maxUses != null) condition.used = { $lt: v.maxUses };
        const updated = await Voucher.updateOne(condition, { $inc: { used: 1 } }, { session });
        if (!updated.modifiedCount) throw conflict('VOUCHER_EXHAUSTED', 'Voucher đã hết hạn hoặc hết lượt.');
        await VoucherUse.updateOne({ voucher: v._id, customer }, { $inc: { count: 1 } }, { session, upsert: true });
      }

      const inventory = [];
      for (const line of priced.lines) {
        const book = await StockBook.findOneAndUpdate({ _id: line.bookId, active: true, stock: { $gte: line.quantity } },
          { $inc: { stock: -line.quantity, soldCount: line.quantity } }, { session, returnDocument: 'after' }).lean();
        if (!book) throw conflict('OUT_OF_STOCK', `Sách “${line.title}” không đủ tồn kho.`);
        inventory.push({ bookId: book._id, stock: book.stock, soldCount: book.soldCount });
      }
      const { customerName, phone, email, province, district, ward, address, notes, paymentMethod } = input;
      const [order] = await Order.create([{
        requestKey, requestHash, customer: customer ?? null, customerName, phone, email, province, district, ward, address,
        notes, paymentMethod, orderCode: (priced.bankTransfer ? 'SACHHAY' : 'SH-') + randomBytes(8).toString('hex').toUpperCase(),
        bankTransfer: priced.bankTransfer,
        paymentStatus: priced.bankTransfer ? 'pending' : undefined,
        items: priced.lines, subtotal: priced.subtotal, discount: priced.discount, shippingFee: priced.shippingFee,
        total: priced.total, voucherCode: priced.voucherCode, voucher: priced.voucher?._id, inventory,
      }], { session });
      return { order: order.toObject(), created: true };
    }, { readPreference: 'primary' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.requestKey) {
      const existing = await Order.findOne({ requestKey }).lean();
      if (existing) return replay(existing, customer, requestHash);
    }
    throw error;
  }
}

export function orderPayload(order) {
  const { _id, customer, requestKey, requestHash, voucher, __v, inventory, updatedAt, bankTransfer, sepayTransactionId, ...fields } = order;
  return {
    order: { ...fields, id: String(_id), source: 'checkout-api', statusHistory: [
      { status: 'pending', timestamp: new Date(fields.createdAt).toISOString(), note: 'Đơn hàng đã được ghi nhận.' },
    ] },
    inventory,
    ...(bankTransfer && {
      payment: { ...bankPaymentDetails(order), token: paymentAccessToken(_id) },
    }),
  };
}
