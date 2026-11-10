import { createHmac, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Order, SepayEvent } from './models.mjs';

const eventInput = z.object({
  id: z.number().int().positive(),
  gateway: z.string().trim().min(1).max(100),
  accountNumber: z.string().trim().min(1).max(30),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number().int().positive(),
  content: z.string().max(4000),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  referenceCode: z.string().max(150).nullable().optional(),
});

function validSignature(req, secret) {
  const timestamp = req.get('X-SePay-Timestamp') ?? '';
  const signature = req.get('X-SePay-Signature') ?? '';
  if (!/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
    || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(timestamp + '.').update(req.body).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), 'hex'));
}

function orderCodeFrom(content) {
  const codes = new Set(content.toUpperCase().match(/(?<![A-Z0-9])SACHHAY[A-F0-9]{16}(?![A-Z0-9])/g));
  return codes.size === 1 ? [...codes][0] : undefined;
}

function bankDate(value) {
  const date = new Date(value.replace(' ', 'T') + '+07:00');
  if (!Number.isFinite(date.getTime())) return null;
  const local = new Date(date.getTime() + 7 * 60 * 60_000).toISOString().slice(0, 19).replace('T', ' ');
  return local === value ? date : null;
}

async function recordTransfer(event, transferredAt, orderCode) {
  const eventId = String(event.id);
  try {
    await mongoose.connection.transaction(async session => {
      if (await SepayEvent.exists({ _id: eventId }).session(session)) return;
      const order = orderCode ? await Order.findOne({ orderCode }).session(session).lean() : null;
      let result;
      if (event.transferType !== 'in') result = 'money_out';
      else if (!orderCode) result = 'missing_or_ambiguous_code';
      else if (order?.paymentMethod !== 'BANK_TRANSFER' || !order.bankTransfer) result = 'unknown_order';
      else if (!/^woori(?:\s+bank)?$/i.test(event.gateway) || event.accountNumber !== order.bankTransfer.accountNumber) result = 'wrong_destination';
      else if (event.transferAmount !== order.total) result = 'wrong_amount';
      else if (transferredAt.getTime() < Math.floor(new Date(order.createdAt).getTime() / 1000) * 1000) result = 'transfer_before_order';
      else if (order.paymentStatus !== 'pending') result = 'already_paid';
      else {
        const updated = await Order.updateOne(
          { _id: order._id, paymentStatus: 'pending' },
          { $set: { paymentStatus: 'paid', paidAt: transferredAt, sepayTransactionId: eventId } },
          { session },
        );
        result = updated.modifiedCount === 1 ? 'paid' : 'already_paid';
      }
      // Record the disposition atomically with the payment so a retry cannot apply it twice.
      await SepayEvent.create([{
        _id: eventId, orderCode, transferredAt, result, gateway: event.gateway,
        amount: event.transferAmount, referenceCode: event.referenceCode,
      }], { session });
    }, { readPreference: 'primary', writeConcern: { w: 'majority' } });
  } catch (error) {
    if (error.code !== 11000 || !await SepayEvent.exists({ _id: eventId })) throw error;
  }
}

export async function sepayWebhook(req, res, next) {
  const secret = process.env.SEPAY_WEBHOOK_SECRET?.trim();
  if (!secret || secret.length < 24) return res.status(503).json({ success: false });
  if (!Buffer.isBuffer(req.body)) return res.status(415).json({ success: false });
  if (!validSignature(req, secret)) return res.status(401).json({ success: false });

  let json;
  try {
    json = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ success: false });
  }
  const parsed = eventInput.safeParse(json);
  if (!parsed.success) return res.status(400).json({ success: false });
  const event = parsed.data;
  const transferredAt = bankDate(event.transactionDate);
  if (!transferredAt) return res.status(400).json({ success: false });
  try {
    await recordTransfer(event, transferredAt, orderCodeFrom(event.content));
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
}
