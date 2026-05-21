const crypto      = require('crypto');
const mongoose    = require('mongoose');
const Payment     = require('../../models/Payment');
const Transaction = require('../../models/Transaction');
const Appointment = require('../../models/Appointment');
const Slot        = require('../../models/Slot');
const Hospital    = require('../../models/Hospital');
const User        = require('../../models/User');
const AppError    = require('../../utils/AppError');
const paginate    = require('../../utils/pagination');
const { createOrder, verifyPayment, calculateCommission, createRefund } = require('../../services/razorpayService');
const { createAndSend } = require('../notifications/notification.service');
const { sendEmail }     = require('../../services/emailService');

// ── Create Razorpay order (called before showing payment UI) ───────────────
const createPaymentOrder = async (patientId, { appointmentId }) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId });
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.status !== 'pending') throw new AppError('Payment already processed or appointment is not pending', 400);

  const order = await createOrder(appt.advanceAmount, 'INR', `appt_${appointmentId}`);
  return { orderId: order.id, amount: order.amount, currency: order.currency, appointmentId };
};

// ── Verify signature + confirm appointment ─────────────────────────────────
const verifyAndConfirm = async ({ appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, patientId }) => {
  const isValid = verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) throw new AppError('Payment signature verification failed. Please contact support.', 400);

  const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId })
    .populate('hospital', 'commissionRate name fcmToken')
    .populate('doctor',   'name specialization')
    .populate('patient',  'name email fcmToken');

  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.payment) throw new AppError('Payment already recorded for this appointment', 409);

  const { commissionAmount, hospitalReceivable } = calculateCommission(appt.advanceAmount, appt.hospital.commissionRate);

  const payment = await Payment.create({
    appointment:        appt._id,
    patient:            patientId,
    hospital:           appt.hospital._id,
    totalAmount:        appt.totalAmount,
    advancePaid:        appt.advanceAmount,
    remainingAmount:    appt.remainingAmount,
    commissionRate:     appt.hospital.commissionRate,
    commissionAmount,
    hospitalReceivable,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: appt.remainingAmount > 0 ? 'partial' : 'completed',
    paymentMethod: 'razorpay',
  });

  await Transaction.create({
    payment:           payment._id,
    type:              'credit',
    amount:            appt.advanceAmount,
    razorpayPaymentId,
    description:       'Advance payment for appointment',
  });

  // Update appointment
  appt.status  = 'confirmed';
  appt.payment = payment._id;
  await appt.save();

  // Lock the slot
  await Slot.findByIdAndUpdate(appt.slot, { isBooked: true, appointment: appt._id });

  // Notifications
  const patientPayload = {
    recipientId: patientId, recipientModel: 'User',
    fcmToken: appt.patient?.fcmToken,
    title: 'Payment Successful & Appointment Confirmed!',
    body: `Your appointment with ${appt.doctor?.name} on ${appt.appointmentDate.toDateString()} is confirmed.`,
    type: 'payment_success',
    data: { appointmentId: String(appt._id) },
  };
  await createAndSend(patientPayload);

  await createAndSend({
    recipientId: appt.hospital._id, recipientModel: 'Hospital',
    fcmToken: appt.hospital?.fcmToken,
    title: 'Appointment Confirmed',
    body: `Payment received. Appointment with ${appt.patient?.name} is confirmed.`,
    type: 'booking_confirmation',
  });

  // Email
  if (appt.patient?.email) {
    await sendEmail({
      to: appt.patient.email,
      subject: 'Appointment Confirmed – Payment Received',
      template: 'paymentSuccess',
      data: { patientName: appt.patient.name, doctorName: appt.doctor?.name, amount: appt.advanceAmount, transactionId: razorpayPaymentId },
    });
  }

  return { payment, appointment: { _id: appt._id, status: appt.status } };
};

// ── Payment history (patient) ──────────────────────────────────────────────
const getPatientHistory = async (patientId, query) =>
  paginate(Payment, { patient: patientId }, {
    page: query.page, limit: query.limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'appointment', select: 'appointmentDate appointmentTime status' },
      { path: 'hospital',    select: 'name' },
    ],
  });

// ── Payment detail ─────────────────────────────────────────────────────────
const getDetail = async (id, userId, role) => {
  const filter = { _id: id };
  if (role === 'patient')  filter.patient  = userId;
  if (role === 'hospital') filter.hospital = userId;
  const payment = await Payment.findOne(filter)
    .populate('appointment', 'appointmentDate appointmentTime status symptoms')
    .populate('patient',     'name email phone')
    .populate('hospital',    'name')
    .lean();
  if (!payment) throw new AppError('Payment not found', 404);
  return payment;
};

// ── Hospital earnings summary ──────────────────────────────────────────────
const getHospitalSummary = async (hospitalId, query) => {
  const filter = { hospital: hospitalId, status: { $in: ['partial', 'completed'] } };
  const { data, meta } = await paginate(Payment, filter, {
    page: query.page, limit: query.limit,
    sort: { createdAt: -1 },
    populate: [{ path: 'appointment', select: 'appointmentDate' }, { path: 'patient', select: 'name' }],
  });
  const hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
  const totals = await Payment.aggregate([
    { $match: { hospital: hospitalObjectId, status: { $in: ['partial', 'completed'] } } },
    { $group: { _id: null, gross: { $sum: '$totalAmount' }, net: { $sum: '$hospitalReceivable' }, commission: { $sum: '$commissionAmount' }, pending: { $sum: { $cond: [{ $eq: ['$settledToHospital', false] }, '$hospitalReceivable', 0] } } } },
  ]);
  return { payments: data, meta, totals: totals[0] || {} };
};

// ── Razorpay webhook ───────────────────────────────────────────────────────
const handleWebhook = async (rawBody, signature) => {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature || '');
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    throw new AppError('Invalid webhook signature', 400);
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  if (event.event === 'payment.captured') {
    const { order_id, id: paymentId } = event.payload.payment.entity;
    await Payment.findOneAndUpdate({ razorpayOrderId: order_id }, { razorpayPaymentId: paymentId, status: 'completed' });
  }
  if (event.event === 'payment.failed') {
    const { order_id } = event.payload.payment.entity;
    await Payment.findOneAndUpdate({ razorpayOrderId: order_id }, { status: 'failed' });
  }
  if (event.event === 'refund.created') {
    const { payment_id, id: refundId, amount } = event.payload.refund.entity;
    await Payment.findOneAndUpdate({ razorpayPaymentId: payment_id }, { status: 'refunded', refundId, refundAmount: amount / 100 });
  }
  return { received: true };
};

module.exports = { createPaymentOrder, verifyAndConfirm, getPatientHistory, getDetail, getHospitalSummary, handleWebhook };
