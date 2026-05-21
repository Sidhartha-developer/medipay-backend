const crypto   = require('crypto');
const razorpay = require('../config/razorpay');

const createOrder = async (amount, currency = 'INR', receipt) => {
  return razorpay.orders.create({ amount: amount * 100, currency, receipt });
};

const verifyPayment = (orderId, paymentId, signature) => {
  const body     = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature || '');
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

const calculateCommission = (totalAmount, commissionRate) => {
  const commissionAmount   = (totalAmount * commissionRate) / 100;
  const hospitalReceivable = totalAmount - commissionAmount;
  return { commissionAmount, hospitalReceivable };
};

const createRefund = async (paymentId, amount) => {
  return razorpay.payments.refund(paymentId, { amount: amount * 100 });
};

module.exports = { createOrder, verifyPayment, calculateCommission, createRefund };
