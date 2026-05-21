const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const ReviewSchema = new Schema({
  patient:     { type: ObjectId, ref: 'User',        required: true },
  hospital:    { type: ObjectId, ref: 'Hospital',    required: true },
  doctor:      { type: ObjectId, ref: 'Doctor' },
  appointment: { type: ObjectId, ref: 'Appointment', required: true, unique: true },
  rating:      { type: Number, min: 1, max: 5, required: true },
  comment:     String,
  isApproved:  { type: Boolean, default: false },
  isHidden:    { type: Boolean, default: false },
}, { timestamps: true });

ReviewSchema.index({ hospital: 1, isApproved: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
