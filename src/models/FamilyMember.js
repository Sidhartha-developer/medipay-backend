const mongoose = require('mongoose');
const { Schema, Types: { ObjectId } } = mongoose;

const FamilyMemberSchema = new Schema({
  patient:     { type: ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  relation:    { type: String, enum: ['spouse','child','parent','sibling','other'] },
  dateOfBirth: Date,
  gender:      String,
  bloodGroup:  String,
  phone:       String,
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
