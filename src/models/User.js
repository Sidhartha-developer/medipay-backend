const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['patient'], default: 'patient' },
  avatar:   { url: String, publicId: String },
  dateOfBirth: Date,
  gender:   { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: String,
  address:  { street: String, city: String, state: String, pincode: String, country: { type: String, default: 'India' } },
  fcmToken: String,
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
  emailVerifyToken: String,
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

UserSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
});
UserSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };

module.exports = mongoose.model('User', UserSchema);
