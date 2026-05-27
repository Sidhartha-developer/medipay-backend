const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./admin.service');

// Dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  apiResponse.success(res, 'Dashboard stats', await service.getDashboard());
});

// Users
exports.getAllUsers     = asyncHandler(async (req, res) => { const { data, meta } = await service.getAllUsers(req.query);       apiResponse.success(res, 'Users fetched',    data, 200, meta); });
exports.getUserById    = asyncHandler(async (req, res) => { apiResponse.success(res, 'User detail',       await service.getUserById(req.params.id)); });
exports.toggleUser     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Status toggled',    await service.toggleUserStatus(req.params.id)); });

// Hospitals
exports.getAllHospitals    = asyncHandler(async (req, res) => { const { data, meta } = await service.getAllHospitals(req.query); apiResponse.success(res, 'Hospitals fetched', data, 200, meta); });
exports.getHospitalById   = asyncHandler(async (req, res) => { apiResponse.success(res, 'Hospital detail',    await service.getHospitalById(req.params.id)); });
exports.verifyHospital    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Hospital verified',  await service.verifyHospital(req.params.id)); });
exports.toggleHospital    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Status toggled',     await service.toggleHospitalStatus(req.params.id)); });
exports.setCommission     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Commission updated', await service.setCommissionRate(req.params.id, req.body.rate)); });

// Appointments
exports.getAllAppointments = asyncHandler(async (req, res) => { const { data, meta } = await service.getAllAppointments(req.query); apiResponse.success(res, 'Appointments', data, 200, meta); });

// Payments
exports.getAllPayments  = asyncHandler(async (req, res) => { const { data, meta } = await service.getAllPayments(req.query); apiResponse.success(res, 'Payments', data, 200, meta); });
exports.markSettlement = asyncHandler(async (req, res) => { apiResponse.success(res, 'Settlement recorded', await service.markSettlement(req.params.id)); });

// Reviews
exports.getPendingReviews = asyncHandler(async (req, res) => { const { data, meta } = await service.getPendingReviews(req.query); apiResponse.success(res, 'Pending reviews', data, 200, meta); });
exports.approveReview     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Review approved', await service.approveReview(req.params.id)); });
exports.hideReview        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Review hidden',   await service.hideReview(req.params.id)); });

// Notifications
exports.broadcast = asyncHandler(async (req, res) => {
  const result = await service.broadcastNotification(req.body);
  apiResponse.success(res, `Broadcast sent to ${result.sent} devices`, result);
});
