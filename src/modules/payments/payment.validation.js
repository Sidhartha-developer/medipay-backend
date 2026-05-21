const Joi = require('joi');

const verifySchema = Joi.object({
  appointmentId:      Joi.string().hex().length(24).required(),
  razorpayOrderId:    Joi.string().required(),
  razorpayPaymentId:  Joi.string().required(),
  razorpaySignature:  Joi.string().required(),
});

const createOrderSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required(),
});

module.exports = { verifySchema, createOrderSchema };
