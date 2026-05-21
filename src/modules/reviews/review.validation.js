const Joi = require('joi');

const submitSchema = Joi.object({
  appointmentId: Joi.string().hex().length(24).required(),
  hospitalId:    Joi.string().hex().length(24).required(),
  doctorId:      Joi.string().hex().length(24).optional(),
  rating:        Joi.number().integer().min(1).max(5).required(),
  comment:       Joi.string().max(1000).optional(),
});

const editSchema = Joi.object({
  rating:  Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().max(1000).optional(),
});

module.exports = { submitSchema, editSchema };
