import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import { checkoutApp, connectCheckout } from './app.mjs';
import { Order, SepayEvent, StockBook, Voucher, VoucherUse } from './models.mjs';
import { seedCheckout } from './seed.mjs';

const uri = process.env.CHECKOUT_TEST_MONGODB_URI;
const dbName = 'sachhay_checkout_test_' + randomBytes(8).toString('hex');
let server;
let base;
let buyerA;
let buyerB;
const password = randomBytes(18).toString('hex');

before(async () => {
  assert.ok(uri, 'Set CHECKOUT_TEST_MONGODB_URI to a MongoDB test replica set.');
  process.env.CHECKOUT_JWT_SECRET = randomBytes(32).toString('hex');
  await connectCheckout(uri, dbName);
  await seedCheckout();
  server = checkoutApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api/checkout`;
  buyerA = await register('buyer-a@example.test');
  buyerB = await register('buyer-b@example.test');
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (mongoose.connection.name === dbName && mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
});

async function request(path, data, { cookie, key, token, trusted = true } = {}) {
  const headers = {};
  if (data) headers['Content-Type'] = 'application/json';
  if (trusted) headers['X-SachHay-Request'] = '1';
  if (cookie) headers.Cookie = cookie;
  if (key) headers['Idempotency-Key'] = key;
  if (token) headers['X-SachHay-Payment-Token'] = token;
  const response = await fetch(base + path, {
    method: data ? 'POST' : 'GET', headers, body: data ? JSON.stringify(data) : undefined,
  });
  return { status: response.status, data: response.status === 204 ? null : await response.json(), cookie: response.headers.get('set-cookie') };
}

async function register(email) {
  const response = await request('/session/register', { email, password });
  assert.equal(response.status, 201);
  assert.match(response.cookie, /HttpOnly/);
  return response.cookie.split(';')[0];
}

function cart(bookId, quantity, voucherCode, paymentMethod = 'STORE_PICKUP') {
  return { items: [{ bookId, quantity }], voucherCode, paymentMethod };
}

function shipping(quote, customerName = 'Khách kiểm thử') {
  return {
    ...quote, customerName, phone: '0901234567', email: 'shipping@example.test',
    province: 'Hà Nội', district: 'Ba Đình', ward: 'Điện Biên', address: '12 Sách Hay',
  };
}

async function approved(input, cookie) {
  const result = await request('/quote', input, { cookie });
  assert.equal(result.status, 200);
  return { ...input, quoteVersion: result.data.quoteVersion };
}

async function fixtureVoucher(code, maxUses = 100) {
  return Voucher.create({
    code, kind: 'fixed', value: 1000, minimum: 0, active: true,
    validFrom: new Date(Date.now() - 60_000), validUntil: new Date(Date.now() + 600_000),
    maxUses, maxPerUser: 1, used: 0,
  });
}

test('session is issued by the server; untrusted posts and forged voucher users are rejected', async () => {
  const bad = await request('/session/login', { email: 'buyer-a@example.test', password: 'incorrect-password' });
  assert.equal(bad.status, 401);
  const logged = await request('/session/login', { email: 'BUYER-A@example.test', password });
  assert.equal(logged.status, 200);
  assert.equal((await request('/session', undefined, { cookie: logged.cookie.split(';')[0] })).data.email, 'buyer-a@example.test');
  assert.equal((await request('/session/logout', {}, { cookie: buyerA })).status, 204);
  assert.equal((await request('/quote', cart('book-01', 1), { trusted: false })).status, 403);
  const guest = await request('/quote', { ...cart('book-01', 2, 'SACHHAY20K'), userId: 'buyer-a' });
  assert.equal(guest.status, 401);
  assert.equal(guest.data.code, 'VOUCHER_LOGIN_REQUIRED');
});

test('quotes enforce minimum, expiration, shipping discount and capped percentage using database prices', async () => {
  const minimum = await request('/quote', cart('book-01', 1, 'SACHHAY20K'), { cookie: buyerA });
  assert.equal(minimum.status, 400);
  assert.equal(minimum.data.code, 'MINIMUM_NOT_MET');
  const expired = await fixtureVoucher('EXPIRED');
  await Voucher.updateOne({ _id: expired._id }, { $set: { validUntil: new Date(Date.now() - 1000) } });
  assert.equal((await request('/quote', cart('book-01', 2, 'EXPIRED'), { cookie: buyerA })).status, 404);
  const express = await request('/quote', { ...cart('book-01', 2, 'FREESHIP', 'COD'), total: 1 }, { cookie: buyerA });
  assert.equal(express.status, 200);
  assert.equal(express.data.total, 172800);
  assert.equal(express.data.shippingFee, 0);
  const percentage = await request('/quote', cart('book-01', 5, 'GIAM15'), { cookie: buyerA });
  assert.equal(percentage.status, 200);
  assert.equal(percentage.data.discount, 60000);
  assert.equal((await Voucher.findOne({ code: 'GIAM15' })).used, 0);
});

test('replaying a submitted order returns the same order and consumes stock and voucher once', async () => {
  const startStock = (await StockBook.findById('book-01')).stock;
  const quoted = await approved(cart('book-01', 2, 'SACHHAY20K'), buyerA);
  const key = randomUUID();
  const body = { ...shipping(quoted), total: 1 };
  const [first, second] = await Promise.all([
    request('/orders', body, { cookie: buyerA, key }),
    request('/orders', body, { cookie: buyerA, key }),
  ]);
  assert.deepEqual([first.status, second.status].sort(), [200, 201]);
  assert.equal(first.data.order.id, second.data.order.id);
  assert.equal(first.data.order.total, 152800);
  assert.equal((await StockBook.findById('book-01')).stock, startStock - 2);
  assert.equal((await Voucher.findOne({ code: 'SACHHAY20K' })).used, 1);
  const limit = await request('/quote', quoted, { cookie: buyerA });
  assert.equal(limit.data.code, 'VOUCHER_USER_LIMIT');
  assert.equal((await request('/orders', body, { cookie: buyerB, key })).data.code, 'ORDER_KEY_REUSED');
});

test('a concurrent user limit and global voucher limit each allow one order', async () => {
  for (const [code, limit, secondBuyer, failure] of [
    ['USER_RACE', 100, buyerA, 'VOUCHER_USER_LIMIT'],
    ['GLOBAL_RACE', 1, buyerB, 'VOUCHER_EXHAUSTED'],
  ]) {
    const voucher = await fixtureVoucher(code, limit);
    const input = cart('book-02', 1, code);
    const [a, b] = await Promise.all([approved(input, buyerA), approved(input, secondBuyer)]);
    const outcomes = await Promise.all([
      request('/orders', shipping(a), { cookie: buyerA, key: randomUUID() }),
      request('/orders', shipping(b), { cookie: secondBuyer, key: randomUUID() }),
    ]);
    assert.deepEqual(outcomes.map(result => result.status).sort(), [201, 409]);
    assert.equal(outcomes.find(result => result.status === 409).data.code, failure);
    assert.equal((await Voucher.findById(voucher.id)).used, 1);
    assert.equal(await VoucherUse.countDocuments({ voucher: voucher.id }), 1);
  }
});

test('stock races and changed prices cannot create invalid orders', async () => {
  await StockBook.updateOne({ _id: 'book-03' }, { $set: { stock: 1 } });
  const quoted = await approved(cart('book-03', 1));
  const outcomes = await Promise.all([
    request('/orders', shipping(quoted), { key: randomUUID() }),
    request('/orders', shipping(quoted), { key: randomUUID() }),
  ]);
  assert.deepEqual(outcomes.map(result => result.status).sort(), [201, 409]);
  assert.equal(outcomes.find(result => result.status === 409).data.code, 'OUT_OF_STOCK');
  assert.equal((await StockBook.findById('book-03')).stock, 0);

  const oldPrice = await approved(cart('book-04', 1));
  await StockBook.updateOne({ _id: 'book-04' }, { $inc: { price: 1000 } });
  const stale = await request('/orders', shipping(oldPrice), { key: randomUUID() });
  assert.equal(stale.status, 409);
  assert.equal(stale.data.code, 'QUOTE_CHANGED');
});

test('transaction rolls back inventory and voucher when the final order write fails', async () => {
  const voucher = await fixtureVoucher('ROLLBACK');
  const quoted = await approved(cart('book-05', 1, voucher.code), buyerB);
  const oldStock = (await StockBook.findById('book-05')).stock;
  const duplicatePhone = '0901234567';
  // Reject only the new write, after the service has changed inventory and voucher counters.
  await mongoose.connection.db.command({ collMod: Order.collection.name, validator: { phone: { $ne: duplicatePhone } } });
  try {
    const rejected = await request('/orders', shipping(quoted), { cookie: buyerB, key: randomUUID() });
    assert.equal(rejected.status, 500);
    assert.equal((await StockBook.findById('book-05')).stock, oldStock);
    assert.equal((await Voucher.findById(voucher.id)).used, 0);
    assert.equal(await VoucherUse.countDocuments({ voucher: voucher.id }), 0);
  } finally {
    await mongoose.connection.db.command({ collMod: Order.collection.name, validator: {} });
  }
});

const demoAccount = '000000000001';
const webhookSecret = randomBytes(32).toString('hex');

async function sendSepay(event, { sign = true, timestamp = String(Math.floor(Date.now() / 1000)) } = {}) {
  // The spacing and Unicode are part of the bytes SePay signs.
  const raw = JSON.stringify(event, null, 2);
  const signature = createHmac('sha256', webhookSecret).update(timestamp + '.').update(raw).digest('hex');
  const url = new URL('/api/payment/sepay-webhook', base);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SePay-Timestamp': timestamp,
      'X-SePay-Signature': 'sha256=' + (sign ? signature : '0'.repeat(64)),
    },
    body: raw,
  });
  return { status: response.status, data: await response.json() };
}

test('VietQR stays unavailable without a secret and returns server-priced payment details when enabled', async () => {
  const previous = process.env.SEPAY_WEBHOOK_SECRET;
  delete process.env.SEPAY_WEBHOOK_SECRET;
  const input = cart('book-01', 1, undefined, 'BANK_TRANSFER');
  try {
    assert.equal((await request('/quote', input)).status, 503);
    assert.equal((await request('/quote', cart('book-01', 1))).data.bankTransferAvailable, false);
  } finally {
    if (previous !== undefined) process.env.SEPAY_WEBHOOK_SECRET = previous;
  }

  process.env.SEPAY_WEBHOOK_SECRET = webhookSecret;
  process.env.VIETQR_BANK_BIN = '970457';
  process.env.VIETQR_ACCOUNT_NUMBER = demoAccount;
  process.env.VIETQR_ACCOUNT_NAME = 'TAI KHOAN KIEM THU';
  const quoted = await approved(input);
  const response = await request('/orders', { ...shipping(quoted), total: 1 }, { key: randomUUID() });
  assert.equal(response.status, 201);
  const { order, payment } = response.data;
  assert.match(order.orderCode, /^SACHHAY[A-F0-9]{16}$/);
  assert.equal(payment.status, 'pending');
  assert.equal(payment.amount, 111400);
  const image = new URL(payment.qrUrl);
  assert.equal(image.origin, 'https://img.vietqr.io');
  assert.equal(image.searchParams.get('amount'), '111400');
  assert.equal(image.searchParams.get('addInfo'), order.orderCode);
  const status = `/orders/${order.orderCode}/payment`;
  assert.equal((await request(status)).status, 404);
  assert.equal((await request(status, undefined, { token: '0'.repeat(64) })).status, 404);
  const result = await request(status, undefined, { token: payment.token });
  assert.equal(result.status, 200);
  assert.equal(result.data.status, 'pending');
  assert.equal(result.data.token, undefined);
  assert.equal(result.data.phone, undefined);
});

test('signed SePay webhook validates the transfer and credits a bank order only once', async () => {
  const quoted = await approved(cart('book-02', 1, undefined, 'BANK_TRANSFER'));
  const key = randomUUID();
  const input = shipping(quoted);
  const created = await request('/orders', input, { key });
  assert.equal(created.status, 201);
  const { order, payment } = created.data;
  const stockAfterOrder = (await StockBook.findById('book-02')).stock;
  const timestamp = new Date();
  const event = {
    id: 10001,
    gateway: 'Woori Bank',
    accountNumber: demoAccount,
    transferType: 'in',
    transferAmount: order.total,
    content: `Nhận tiền ${order.orderCode} từ khách`,
    transactionDate: new Date(timestamp.getTime() + 7 * 3_600_000).toISOString().slice(0, 19).replace('T', ' '),
    referenceCode: 'QA-10001',
  };
  assert.equal((await sendSepay(event, { sign: false })).status, 401);
  assert.equal((await sendSepay(event, { timestamp: '1000000000' })).status, 401);
  assert.equal(await SepayEvent.countDocuments(), 0);

  for (const [fields, result] of [
    [{ id: 10002, transferAmount: event.transferAmount - 1 }, 'wrong_amount'],
    [{ id: 10003, accountNumber: '000000000002' }, 'wrong_destination'],
    [{ id: 10004, transferType: 'out' }, 'money_out'],
    [{ id: 10005, content: order.orderCode + ' SACHHAY1111111111111111' }, 'missing_or_ambiguous_code'],
    [{ id: 10006, transactionDate: '2020-01-01 08:00:00' }, 'transfer_before_order'],
  ]) {
    assert.deepEqual(await sendSepay({ ...event, ...fields }), { status: 200, data: { success: true } });
    assert.equal((await SepayEvent.findById(String(fields.id))).result, result);
  }
  assert.equal((await Order.findById(order.id)).paymentStatus, 'pending');

  const callbacks = await Promise.all([sendSepay(event), sendSepay(event), sendSepay({ ...event, id: 10007 })]);
  for (const callback of callbacks) assert.deepEqual(callback, { status: 200, data: { success: true } });
  assert.equal(await SepayEvent.countDocuments({ orderCode: order.orderCode, result: 'paid' }), 1);
  assert.equal(await SepayEvent.countDocuments({ orderCode: order.orderCode, result: 'already_paid' }), 1);
  const saved = await Order.findById(order.id);
  assert.equal(saved.paymentStatus, 'paid');
  assert.equal(saved.paidAt.toISOString(), new Date(event.transactionDate.replace(' ', 'T') + '+07:00').toISOString());
  assert.equal((await StockBook.findById('book-02')).stock, stockAfterOrder);

  const polled = await request(`/orders/${order.orderCode}/payment`, undefined, { token: payment.token });
  assert.equal(polled.data.status, 'paid');
  assert.equal(polled.data.qrUrl, null);
  const retriedOrder = await request('/orders', input, { key });
  assert.equal(retriedOrder.status, 200);
  assert.equal(retriedOrder.data.order.id, order.id);
  assert.equal(retriedOrder.data.payment.status, 'paid');
});
