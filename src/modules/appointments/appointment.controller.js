const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./appointment.service');

exports.book       = asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment booked. Complete payment to confirm.', await service.bookAppointment(req.user._id, req.body), 201); });
exports.getAll     = asyncHandler(async (req, res) => { const { data, meta } = await service.getMyAppointments(req.user._id, req.query); apiResponse.success(res, 'Appointments fetched', data, 200, meta); });
exports.getDetail  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment detail', await service.getDetail(req.params.id, req.user._id, req.role)); });
exports.cancel     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment cancelled', await service.cancelAppointment(req.params.id, req.user._id, req.body.reason)); });
exports.reschedule = asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment rescheduled', await service.rescheduleAppointment(req.params.id, req.user._id, req.body)); });
exports.upcoming   = asyncHandler(async (req, res) => { apiResponse.success(res, 'Upcoming appointments', await service.getUpcoming(req.user._id)); });
