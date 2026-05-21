const Joi = require('joi');

const addDoctorSchema = Joi.object({
  name:            Joi.string().min(2).max(100).required(),
  email:           Joi.string().email().optional(),
  phone:           Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  specialization:  Joi.string().required(),
  qualification:   Joi.array().items(Joi.string()).optional(),
  experience:      Joi.number().min(0).max(60).optional(),
  consultationFee: Joi.number().min(0).required(),
  bio:             Joi.string().max(1000).optional(),
  languages:       Joi.array().items(Joi.string()).optional(),
});

const updateDoctorSchema = Joi.object({
  name:            Joi.string().min(2).max(100).optional(),
  email:           Joi.string().email().optional(),
  phone:           Joi.string().optional(),
  specialization:  Joi.string().optional(),
  qualification:   Joi.array().items(Joi.string()).optional(),
  experience:      Joi.number().optional(),
  consultationFee: Joi.number().min(0).optional(),
  bio:             Joi.string().max(1000).optional(),
  languages:       Joi.array().items(Joi.string()).optional(),
});

module.exports = { addDoctorSchema, updateDoctorSchema };
