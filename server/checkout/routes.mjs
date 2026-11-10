import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createOrder, getOrderPayment, getQuote } from './controller.mjs';
import { authenticate, currentCustomer, customerSession, logout } from './session.mjs';

export const checkoutRoutes = Router();
checkoutRoutes.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
checkoutRoutes.use((req, res, next) => {
  if (req.method === 'POST' && (!req.is('application/json') || req.get('X-SachHay-Request') !== '1')) {
    return res.status(403).json({ code: 'INVALID_REQUEST', message: 'Yêu cầu không hợp lệ.' });
  }
  next();
});
checkoutRoutes.use(customerSession);
const authLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.' },
});
checkoutRoutes.get('/session', currentCustomer);
checkoutRoutes.post('/session/register', authLimit, authenticate('register'));
checkoutRoutes.post('/session/login', authLimit, authenticate('login'));
checkoutRoutes.post('/session/logout', logout);
checkoutRoutes.post('/quote', getQuote);
checkoutRoutes.post('/orders', createOrder);
checkoutRoutes.get('/orders/:orderCode/payment', getOrderPayment);
