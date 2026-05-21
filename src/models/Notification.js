const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const NotificationSchema = new Schema({
  recipient:      { type: ObjectId, required: true },
  recipientModel: { type: String, enum: ['User','Hospital'] },
  title:  String,
  body:   String,
  type:   { type: String, enum: ['booking_confirmation','appointment_reminder','payment_success','cancellation','admin_announcement','general'] },
  data:   Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  isSent: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
