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

// ─────────────────────────────────────────────────────────────
// Hospitals
// ─────────────────────────────────────────────────────────────

exports.getAllHospitals = asyncHandler(async (req, res) => {
  const { data, meta } = await service.getAllHospitals(req.query);

  apiResponse.success(
    res,
    'Hospitals fetched',
    data,
    200,
    meta
  );
});

exports.getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await service.getHospitalById(req.params.id);

  apiResponse.success(
    res,
    'Hospital detail fetched',
    hospital
  );
});

// 🔥 APPROVE HOSPITAL
exports.approveHospital = asyncHandler(async (req, res) => {
  const hospital = await service.approveHospital(
    req.params.id,
    req.user.id
  );

  apiResponse.success(
    res,
    'Hospital approved successfully',
    hospital
  );
});

// 🔥 REJECT HOSPITAL
exports.rejectHospital = asyncHandler(async (req, res) => {
  const hospital = await service.rejectHospital(
    req.params.id,
    req.user.id,
    req.body.reason
  );

  apiResponse.success(
    res,
    'Hospital rejected successfully',
    hospital
  );
});

// 🔥 SUSPEND HOSPITAL
exports.suspendHospital = asyncHandler(async (req, res) => {
  const hospital = await service.suspendHospital(
    req.params.id,
    req.user.id,
    req.body.reason
  );

  apiResponse.success(
    res,
    'Hospital suspended successfully',
    hospital
  );
});

// 🔥 ACTIVATE / DEACTIVATE
exports.toggleHospital = asyncHandler(async (req, res) => {
  const hospital = await service.toggleHospitalStatus(
    req.params.id
  );

  apiResponse.success(
    res,
    'Hospital status updated',
    hospital
  );
});

// 🔥 UPDATE COMMISSION
exports.setCommission = asyncHandler(async (req, res) => {
  const hospital = await service.setCommissionRate(
    req.params.id,
    req.body.rate
  );

  apiResponse.success(
    res,
    'Commission updated successfully',
    hospital
  );
});

// 🔥 GET HOSPITAL DOCTORS
exports.getHospitalDoctors = asyncHandler(async (req, res) => {
  const { data, meta } = await service.getHospitalDoctors(
    req.params.id,
    req.query
  );

  apiResponse.success(
    res,
    'Hospital doctors fetched',
    data,
    200,
    meta
  );
});

// 🔥 GET HOSPITAL APPOINTMENTS
exports.getHospitalAppointments = asyncHandler(async (req, res) => {
  const { data, meta } =
    await service.getHospitalAppointments(
      req.params.id,
      req.query
    );

  apiResponse.success(
    res,
    'Hospital appointments fetched',
    data,
    200,
    meta
  );
});

// 🔥 GET HOSPITAL PAYMENTS
exports.getHospitalPayments = asyncHandler(async (req, res) => {
  const { data, meta } =
    await service.getHospitalPayments(
      req.params.id,
      req.query
    );

  apiResponse.success(
    res,
    'Hospital payments fetched',
    data,
    200,
    meta
  );
});

// 🔥 FULL HOSPITAL PROFILE
exports.getHospitalFullProfile = asyncHandler(async (req, res) => {
  const profile =
    await service.getHospitalFullProfile(
      req.params.id
    );

  apiResponse.success(
    res,
    'Hospital full profile fetched',
    profile
  );
});

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
