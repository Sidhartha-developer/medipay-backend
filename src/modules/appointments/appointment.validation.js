const Joi = require('joi');

const bookSchema = Joi.object({
  doctorId:        Joi.string().hex().length(24).required(),
  hospitalId:      Joi.string().hex().length(24).required(),
  slotId:          Joi.string().hex().length(24).required(),
  serviceId:       Joi.string().hex().length(24).optional(),
  familyMemberId:  Joi.string().hex().length(24).optional().allow(null),
  appointmentDate: Joi.date().min('now').required(),
  appointmentTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  symptoms:        Joi.string().max(1000).optional(),
  notes:           Joi.string().max(500).optional(),
});

const cancelSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});

const rescheduleSchema = Joi.object({
  newSlotId:       Joi.string().hex().length(24).required(),
  appointmentDate: Joi.date().min('now').required(),
  appointmentTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
});

module.exports = { bookSchema, cancelSchema, rescheduleSchema };
