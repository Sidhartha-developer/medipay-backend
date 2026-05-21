const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const authService  = require('./auth.service');

exports.registerPatient  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Registration successful',        await authService.registerPatient(req.body),  201); });
exports.registerHospital = asyncHandler(async (req, res) => { const data = await authService.registerHospital(req.body); apiResponse.success(res, data.message, { hospital: data.hospital }, 201); });
exports.loginPatient     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Login successful',               await authService.loginPatient(req.body)); });
exports.loginHospital    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Hospital login successful',      await authService.loginHospital(req.body)); });
exports.loginAdmin       = asyncHandler(async (req, res) => { apiResponse.success(res, 'Admin login successful',         await authService.loginAdmin(req.body)); });
exports.refreshToken     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Token refreshed',               await authService.refreshToken(req.body.refreshToken)); });
exports.forgotPassword   = asyncHandler(async (req, res) => { const data = await authService.forgotPassword(req.body.email); apiResponse.success(res, data.message); });
exports.resetPassword    = asyncHandler(async (req, res) => { const data = await authService.resetPassword(req.body); apiResponse.success(res, data.message); });
exports.updateFcmToken   = asyncHandler(async (req, res) => { const data = await authService.updateFcmToken(req.user, req.body.fcmToken); apiResponse.success(res, data.message); });
