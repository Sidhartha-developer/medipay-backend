const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const PaymentSchema = new Schema({
  appointment:        { type: ObjectId, ref: 'Appointment', required: true },
  patient:            { type: ObjectId, ref: 'User',        required: true },
  hospital:           { type: ObjectId, ref: 'Hospital',    required: true },
  totalAmount:        { type: Number, required: true },
  // advancePaid:        { type: Number, default: 0 },
  // remainingAmount:    Number,
  commissionRate:     Number,
  commissionAmount:   Number,
  hospitalReceivable: Number,
  razorpayOrderId:    String,
  razorpayPaymentId:  String,
  razorpaySignature:  String,
  status: { type: String, enum: ['pending','completed','refunded','failed'], default: 'pending' },
  paymentMethod:      String,
  refundId:           String,
  refundAmount:       Number,
  settledToHospital:  { type: Boolean, default: false },
  settlementDate:     Date,
}, { timestamps: true });

PaymentSchema.index({ hospital: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ appointment: 1 }, { unique: true });
PaymentSchema.index({ razorpayOrderId: 1 }, { sparse: true });
PaymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payment', PaymentSchema);
