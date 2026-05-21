const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const DoctorSchema = new Schema({
  hospital:        { type: ObjectId, ref: 'Hospital', required: true },
  name:            { type: String, required: true },
  email:           String,
  phone:           String,
  specialization:  { type: String, required: true },
  qualification:   [String],
  experience:      Number,
  consultationFee: { type: Number, required: true },
  avatar:          { url: String, publicId: String },
  bio:             String,
  languages:       [String],
  isAvailable:     { type: Boolean, default: true },
  isActive:        { type: Boolean, default: true },
  averageRating:   { type: Number, default: 0 },
  totalReviews:    { type: Number, default: 0 },
}, { timestamps: true });

DoctorSchema.index({ hospital: 1 });
DoctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', DoctorSchema);
