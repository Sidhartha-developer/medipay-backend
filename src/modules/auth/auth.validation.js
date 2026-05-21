const Joi = require('joi');

const registerPatientSchema = Joi.object({
  name:     Joi.string().min(2).max(50).required(),
  email:    Joi.string().email().required(),
  phone:    Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({ 'string.pattern.base': 'Enter a valid 10-digit Indian mobile number' }),
  password: Joi.string().min(8).required(),
});

const registerHospitalSchema = Joi.object({
  name:           Joi.string().min(2).max(100).required(),
  email:          Joi.string().email().required(),
  phone:          Joi.string().required(),
  password:       Joi.string().min(8).required(),
  registrationNo: Joi.string().optional(),
  description:    Joi.string().optional(),
  address:        Joi.object().optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema  = Joi.object({ email: Joi.string().email().required() });

const resetPasswordSchema = Joi.object({
  email:       Joi.string().email().required(),
  otp:         Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

const refreshTokenSchema = Joi.object({ refreshToken: Joi.string().required() });

const fcmTokenSchema = Joi.object({ fcmToken: Joi.string().required() });

module.exports = {
  registerPatientSchema, registerHospitalSchema,
  loginSchema, forgotPasswordSchema, resetPasswordSchema,
  refreshTokenSchema, fcmTokenSchema,
};
