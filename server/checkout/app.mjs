import express from 'express';
import mongoose from 'mongoose';
import { mountCatalog } from '../catalog.mjs';
import { ContactMessage, createContactMessage, limitContact } from '../contact.mjs';
import { checkoutRoutes } from './routes.mjs';
import { sepayWebhook } from './sepay-webhook.mjs';
import { CheckoutError } from './input.mjs';
import { Customer, Order, SepayEvent, StockBook, Voucher, VoucherUse } from './models.mjs';

export async function connectCheckout(uri, dbName) {
  if (!uri) throw new Error('Set CHECKOUT_MONGODB_URI before starting');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, dbName });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid') {
    await mongoose.disconnect();
    throw new Error('Checkout transactions require a MongoDB replica set or sharded cluster');
  }
  await Promise.all([ContactMessage, Customer, Order, SepayEvent, StockBook, Voucher, VoucherUse].map(model => model.init()));
}

export function checkoutApp() {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.CHECKOUT_TRUST_PROXY === '1') app.set('trust proxy', 1);
  mountCatalog(app);
  app.post('/api/payment/sepay-webhook', express.raw({ type: 'application/json', limit: '16kb', inflate: false }), sepayWebhook);
  app.post('/api/contact', limitContact, express.json({ limit: '16kb' }), createContactMessage);
  app.use('/api/checkout', express.json({ limit: '32kb' }), checkoutRoutes);
  app.use('/api/checkout', (_req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'API không tồn tại.' }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof CheckoutError) return res.status(error.status).json({ code: error.code, message: error.message });
    if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
      return res.status(error.status).json({ code: 'INVALID_JSON', message: 'Nội dung yêu cầu không hợp lệ.' });
    }
    console.error('API request failed', { name: error.name, code: error.code });
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại.' });
  });
  return app;
}
