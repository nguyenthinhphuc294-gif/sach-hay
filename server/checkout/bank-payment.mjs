import { createHmac, timingSafeEqual } from 'node:crypto';

export const bankOrderCode = /^SACHHAY[A-F0-9]{16}$/;

export function bankTransferConfig() {
  const bankBin = process.env.VIETQR_BANK_BIN?.trim();
  const accountNumber = process.env.VIETQR_ACCOUNT_NUMBER?.trim();
  const accountName = process.env.VIETQR_ACCOUNT_NAME?.trim();
  const template = process.env.VIETQR_TEMPLATE?.trim() || 'compact2';
  const secret = process.env.SEPAY_WEBHOOK_SECRET?.trim();
  if (!secret || secret.length < 24
    || bankBin !== '970457' || !/^\d{6,19}$/.test(accountNumber ?? '')
    || !accountName || accountName.length > 100 || !/^[a-zA-Z0-9_-]{1,64}$/.test(template)) return null;
  return { bankBin, bankName: 'Woori Bank', accountNumber, accountName, template };
}

export function paymentAccessToken(orderId) {
  return createHmac('sha256', process.env.CHECKOUT_JWT_SECRET)
    .update('sachhay:payment-status:v1:' + orderId).digest('hex');
}

export function canReadPayment(order, token) {
  return /^[a-f0-9]{64}$/.test(token ?? '') && timingSafeEqual(
    Buffer.from(token, 'hex'), Buffer.from(paymentAccessToken(order._id), 'hex'),
  );
}

export function bankPaymentDetails(order) {
  const { bankBin, bankName, accountNumber, accountName, template } = order.bankTransfer;
  const { orderCode, total: amount, paymentStatus: status, paidAt } = order;
  const image = new URL(`https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.svg`);
  image.search = new URLSearchParams({ amount: String(amount), addInfo: orderCode, accountName });
  return {
    orderCode, status, paidAt, amount, bankName, accountNumber, accountName,
    qrUrl: status === 'pending' ? image.href : null,
  };
}
