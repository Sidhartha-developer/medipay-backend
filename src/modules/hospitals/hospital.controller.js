const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./hospital.service');

// Public
exports.search            = asyncHandler(async (req, res) => { const { data, meta } = await service.searchHospitals(req.query); apiResponse.success(res, 'Hospitals fetched', data, 200, meta); });
exports.getNearby         = asyncHandler(async (req, res) => { apiResponse.success(res, 'Nearby hospitals',   await service.getNearby(req.query)); });
exports.getById           = asyncHandler(async (req, res) => { apiResponse.success(res, 'Hospital detail',    await service.getById(req.params.id)); });
exports.getHospitalDoctors  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Doctors',          await service.getHospitalDoctors(req.params.id)); });
exports.getHospitalServices = asyncHandler(async (req, res) => { apiResponse.success(res, 'Services',         await service.getHospitalServices(req.params.id)); });
exports.getHospitalReviews  = asyncHandler(async (req, res) => { const { data, meta } = await service.getHospitalReviews(req.params.id, req.query); apiResponse.success(res, 'Reviews', data, 200, meta); });

// Hospital self
exports.getProfile        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Profile',            await service.getProfile(req.user._id)); });
exports.updateProfile     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Profile updated',    await service.updateProfile(req.user._id, req.body)); });
exports.updateLogo        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Logo updated',       await service.updateLogo(req.user._id, req.file)); });
exports.uploadGallery     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Images uploaded',    await service.uploadGalleryImage(req.user._id, req.files)); });
exports.removeGalleryImage= asyncHandler(async (req, res) => { await service.removeGalleryImage(req.user._id, req.params.imageId); apiResponse.success(res, 'Image removed'); });
exports.getDashboardStats = asyncHandler(async (req, res) => { apiResponse.success(res, 'Dashboard stats',    await service.getDashboardStats(req.user._id)); });
exports.getEarnings       = asyncHandler(async (req, res) => { apiResponse.success(res, 'Earnings',           await service.getEarnings(req.user._id, req.query)); });

// Appointment management
exports.getAppointments   = asyncHandler(async (req, res) => { const { data, meta } = await service.getAppointments(req.user._id, req.query); apiResponse.success(res, 'Appointments', data, 200, meta); });
exports.confirmAppointment= asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment confirmed', await service.confirmAppointment(req.user._id, req.params.id)); });
exports.rejectAppointment = asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment rejected',  await service.rejectAppointment(req.user._id, req.params.id, req.body.reason)); });
exports.completeAppointment=asyncHandler(async (req, res) => { apiResponse.success(res, 'Appointment completed', await service.completeAppointment(req.user._id, req.params.id)); });
