const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const AppointmentSchema = new Schema({
  patient:         { type: ObjectId, ref: 'User',         required: true },
  hospital:        { type: ObjectId, ref: 'Hospital',     required: true },
  doctor:          { type: ObjectId, ref: 'Doctor',       required: true },
  slot:            { type: ObjectId, ref: 'Slot',         required: true },
  service:         { type: ObjectId, ref: 'Service' },
  familyMember:    { type: ObjectId, ref: 'FamilyMember' },
  appointmentDate: { type: Date,   required: true },
  appointmentTime: { type: String, required: true },
  symptoms:        String,
  notes:           String,
  status: { type: String, enum: ['pending','confirmed','completed','cancelled','rejected'], default: 'pending' },
  cancellationReason: String,
  rejectionReason:    String,
  totalAmount:        { type: Number, required: true },
  // advanceAmount:      { type: Number, default: 0 },
  // remainingAmount:    Number,
  payment:            { type: ObjectId, ref: 'Payment' },
  isReviewed:         { type: Boolean, default: false },
  reminders:          [{ sentAt: Date, type: String }],
}, { timestamps: true });

AppointmentSchema.index({ patient: 1, status: 1 });
AppointmentSchema.index({ hospital: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index(
  { slot: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed'] } } }
);
AppointmentSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
