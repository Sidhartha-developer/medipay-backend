const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const ServiceSchema = new Schema({
  hospital:    { type: ObjectId, ref: 'Hospital', required: true },
  name:        { type: String, required: true },
  description: String,
  price:       Number,
  duration:    Number,
  category:    String,
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
