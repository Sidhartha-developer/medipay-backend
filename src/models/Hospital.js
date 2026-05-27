const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Schema } = mongoose;

const HospitalSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['hospital'], default: 'hospital' },
  registrationNo: { type: String, unique: true, sparse: true },
  description: String,
  specializations: [String],
  facilities:      [String],
  logo:    { url: String, publicId: String },
  gallery: [{ url: String, publicId: String, caption: String }],
  address: { street: String, city: String, state: String, pincode: String, country: String, coordinates: { type: [Number], index: '2dsphere' } },
  timings: {
    monday:    { open: String, close: String, isClosed: Boolean },
    tuesday:   { open: String, close: String, isClosed: Boolean },
    wednesday: { open: String, close: String, isClosed: Boolean },
    thursday:  { open: String, close: String, isClosed: Boolean },
    friday:    { open: String, close: String, isClosed: Boolean },
    saturday:  { open: String, close: String, isClosed: Boolean },
    sunday:    { open: String, close: String, isClosed: Boolean },
  },
  commissionRate: { type: Number, default: 10 },
  bankDetails: { accountHolder: String, accountNumber: String, ifsc: String, bankName: String },
  isVerified:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  fcmToken:      String,
  averageRating: { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
}, { timestamps: true });

HospitalSchema.index({ 'address.coordinates': '2dsphere' });
HospitalSchema.index({ specializations: 1 });
HospitalSchema.index({ 'address.city': 1 });
HospitalSchema.index({ name: 'text', description: 'text', specializations: 'text' });

HospitalSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
});
HospitalSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };

module.exports = mongoose.model('Hospital', HospitalSchema);
