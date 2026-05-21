const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name:        Joi.string().min(2).max(50).optional(),
  phone:       Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  dateOfBirth: Joi.date().optional(),
  gender:      Joi.string().valid('male','female','other').optional(),
  bloodGroup:  Joi.string().optional(),
  address:     Joi.object({
    street:  Joi.string().optional(),
    city:    Joi.string().optional(),
    state:   Joi.string().optional(),
    pincode: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword:     Joi.string().min(8).required(),
});

const familyMemberSchema = Joi.object({
  name:        Joi.string().required(),
  relation:    Joi.string().valid('spouse','child','parent','sibling','other').required(),
  dateOfBirth: Joi.date().optional(),
  gender:      Joi.string().valid('male','female','other').optional(),
  bloodGroup:  Joi.string().optional(),
  phone:       Joi.string().optional(),
});

module.exports = { updateProfileSchema, changePasswordSchema, familyMemberSchema };
