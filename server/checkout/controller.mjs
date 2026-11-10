import { CheckoutError, orderInput, parse, quoteInput } from './input.mjs';
import { orderPayload, placeOrder, quote } from './service.mjs';
import { Order } from './models.mjs';
import { bankOrderCode, bankPaymentDetails, bankTransferConfig, canReadPayment } from './bank-payment.mjs';

export async function getQuote(req, res, next) {
  try {
    const { voucher, bankTransfer, ...result } = await quote(parse(quoteInput, req.body), req.customerId);
    res.json({ ...result, bankTransferAvailable: Boolean(bankTransferConfig()) });
  } catch (error) {
    next(error);
  }
}

export async function getOrderPayment(req, res, next) {
  try {
    const { orderCode } = req.params;
    const token = req.get('X-SachHay-Payment-Token');
    const order = bankOrderCode.test(orderCode) && /^[a-f0-9]{64}$/.test(token ?? '')
      ? await Order.findOne({ orderCode, paymentMethod: 'BANK_TRANSFER' })
        .select('orderCode bankTransfer total paymentStatus paidAt').lean() : null;
    if (!order?.bankTransfer || !canReadPayment(order, token)) {
      throw new CheckoutError(404, 'PAYMENT_NOT_FOUND', 'Không tìm thấy phiên thanh toán.');
    }
    res.json(bankPaymentDetails(order));
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const requestKey = req.get('Idempotency-Key')?.toLowerCase();
    if (!requestKey || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(requestKey)) {
      throw new CheckoutError(400, 'IDEMPOTENCY_REQUIRED', 'Thiếu mã gửi đơn hợp lệ.');
    }
    const { order, created } = await placeOrder(parse(orderInput, req.body), req.customerId, requestKey);
    res.status(created ? 201 : 200).json(orderPayload(order));
  } catch (error) {
    next(error);
  }
}
