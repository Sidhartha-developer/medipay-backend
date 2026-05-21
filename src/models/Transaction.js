const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const TransactionSchema = new Schema({
  payment:           { type: ObjectId, ref: 'Payment', required: true },
  type:              { type: String, enum: ['credit','debit','refund','settlement'] },
  amount:            Number,
  description:       String,
  razorpayPaymentId: String,
  gateway:           { type: String, default: 'razorpay' },
  metadata:          Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
