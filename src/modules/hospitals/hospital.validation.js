const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name:            Joi.string().optional(),
  phone:           Joi.string().optional(),
  description:     Joi.string().max(2000).optional(),
  specializations: Joi.array().items(Joi.string()).optional(),
  facilities:      Joi.array().items(Joi.string()).optional(),
  address:         Joi.object().optional(),
  timings:         Joi.object().optional(),
  bankDetails:     Joi.object({
    accountHolder: Joi.string().optional(),
    accountNumber: Joi.string().optional(),
    ifsc:          Joi.string().optional(),
    bankName:      Joi.string().optional(),
  }).optional(),
});

module.exports = { updateProfileSchema };
