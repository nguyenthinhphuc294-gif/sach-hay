import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const money = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const count = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const subdocument = { _id: false };
const buyer = { type: Schema.Types.ObjectId, ref: 'CheckoutCustomer' };

export const Customer = model('CheckoutCustomer', new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true }));

export const StockBook = model('CheckoutBook', new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  coverImage: { type: String, required: true },
  price: { ...money, max: 100_000_000 },
  stock: count,
  soldCount: { ...count, default: 0 },
  active: { type: Boolean, default: true },
  catalog: new Schema({
    author: String,
    publisher: String,
    isbn: String,
    originalPrice: Number,
    categoryId: String,
    categoryName: String,
    description: String,
    createdAt: Date,
  }, subdocument),
  coverData: { type: Buffer, select: false },
}));

export const Voucher = model('CheckoutVoucher', new Schema({
  code: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['fixed', 'percentage', 'shipping'], required: true },
  value: { ...money, max: 100_000_000 },
  minimum: money,
  cap: { type: Number, min: 0, validate: Number.isSafeInteger },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  active: { type: Boolean, default: true },
  maxUses: { type: Number, min: 1, validate: Number.isSafeInteger },
  maxPerUser: { ...count, min: 1 },
  used: { ...count, default: 0 },
}));

const voucherUseSchema = new Schema({
  voucher: { type: Schema.Types.ObjectId, ref: 'CheckoutVoucher', required: true },
  customer: { ...buyer, required: true },
  count,
});
voucherUseSchema.index({ voucher: 1, customer: 1 }, { unique: true });
export const VoucherUse = model('CheckoutVoucherUse', voucherUseSchema);

const line = new Schema({
  bookId: { type: String, ref: 'CheckoutBook', required: true },
  title: { type: String, required: true },
  coverImage: String,
  price: money,
  quantity: { ...count, min: 1, max: 99 },
  total: money,
}, subdocument);
const movement = new Schema({
  bookId: { type: String, required: true },
  stock: count,
  soldCount: count,
}, subdocument);

const bankTransfer = new Schema({
  bankBin: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  template: { type: String, required: true },
}, subdocument);

export const Order = model('CheckoutOrder', new Schema({
  requestKey: { type: String, required: true, unique: true },
  requestHash: { type: String, required: true },
  customer: { ...buyer, default: null, index: true },
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  province: String,
  district: String,
  ward: String,
  address: String,
  notes: String,
  paymentMethod: { type: String, enum: ['COD', 'STORE_PICKUP', 'BANK_TRANSFER'], required: true },
  bankTransfer,
  paymentStatus: { type: String, enum: ['pending', 'paid'] },
  paidAt: Date,
  sepayTransactionId: String,
  status: { type: String, enum: ['pending'], default: 'pending' },
  items: { type: [line], required: true },
  subtotal: money,
  discount: money,
  shippingFee: money,
  total: money,
  voucherCode: String,
  voucher: { type: Schema.Types.ObjectId, ref: 'CheckoutVoucher' },
  inventory: [movement],
}, { timestamps: true }));

export const SepayEvent = model('SepayEvent', new Schema({
  _id: { type: String, required: true },
  orderCode: { type: String, index: true },
  gateway: { type: String, required: true },
  amount: money,
  transferredAt: { type: Date, required: true },
  referenceCode: String,
  result: { type: String, required: true },
}, { timestamps: true }));
