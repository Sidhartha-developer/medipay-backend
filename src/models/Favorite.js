const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const FavoriteSchema = new Schema({
  patient:  { type: ObjectId, ref: 'User',     required: true },
  hospital: { type: ObjectId, ref: 'Hospital', required: true },
}, { timestamps: true });

FavoriteSchema.index({ patient: 1, hospital: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
