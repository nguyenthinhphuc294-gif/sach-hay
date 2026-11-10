import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { z } from 'zod';

const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().max(254).pipe(z.email()),
  message: z.string().trim().min(10).max(2000),
}).strict();

export const ContactMessage = mongoose.model('ContactMessage', new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, maxlength: 254 },
  message: { type: String, required: true, minlength: 10, maxlength: 2000 },
}, { timestamps: { updatedAt: false }, collection: 'contactmessages' }));

export const limitContact = rateLimit({
  windowMs: 10 * 60_000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { code: 'RATE_LIMITED', message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.' },
});

export async function createContactMessage(req, res, next) {
  res.set('Cache-Control', 'no-store');
  if (!req.is('application/json') || req.get('X-SachHay-Request') !== '1') {
    return res.status(403).json({ code: 'INVALID_REQUEST', message: 'Yêu cầu gửi tin nhắn không hợp lệ.' });
  }
  const parsed = contactInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ code: 'INVALID_CONTACT', message: 'Vui lòng kiểm tra họ tên, email và nội dung tin nhắn.' });
  }
  try {
    const contact = await ContactMessage.create(parsed.data);
    return res.status(201).json({ reference: contact.id });
  } catch (error) {
    return next(error);
  }
}
