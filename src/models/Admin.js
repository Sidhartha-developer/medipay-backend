const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Schema } = mongoose;

const AdminSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role:     { type: String, enum: ['super_admin'], default: 'super_admin' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

AdminSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
AdminSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.password); };

module.exports = mongoose.model('Admin', AdminSchema);
