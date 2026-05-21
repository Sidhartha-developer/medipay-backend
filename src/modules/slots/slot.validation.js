const Joi = require('joi');

const generateSchema = Joi.object({
  doctorId:   Joi.string().hex().length(24).required(),
  date:       Joi.date().required(),
  startTime:  Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime:    Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  duration:   Joi.number().valid(15, 20, 30, 45, 60).default(30),
  breakStart: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  breakEnd:   Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
});

const bulkGenerateSchema = Joi.object({
  doctorId:    Joi.string().hex().length(24).required(),
  startDate:   Joi.date().required(),
  endDate:     Joi.date().min(Joi.ref('startDate')).required(),
  startTime:   Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime:     Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  duration:    Joi.number().valid(15, 20, 30, 45, 60).default(30),
  breakStart:  Joi.string().optional(),
  breakEnd:    Joi.string().optional(),
  excludeDays: Joi.array().items(Joi.string().valid('monday','tuesday','wednesday','thursday','friday','saturday','sunday')).default([]),
});

module.exports = { generateSchema, bulkGenerateSchema };
