const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const SlotSchema = new Schema({
  doctor:      { type: ObjectId, ref: 'Doctor',      required: true },
  hospital:    { type: ObjectId, ref: 'Hospital',    required: true },
  date:        { type: Date,   required: true },
  startTime:   { type: String, required: true },
  endTime:     { type: String, required: true },
  duration:    { type: Number, default: 30 },
  isBooked:    { type: Boolean, default: false },
  isBlocked:   { type: Boolean, default: false },
  appointment: { type: ObjectId, ref: 'Appointment', default: null },
}, { timestamps: true });

SlotSchema.index({ doctor: 1, date: 1 });
SlotSchema.index({ hospital: 1, date: 1 });
SlotSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });
SlotSchema.index({ doctor: 1, date: 1, isBooked: 1, isBlocked: 1 });

module.exports = mongoose.model('Slot', SlotSchema);
