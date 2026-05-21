const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./doctor.service');

exports.getById          = asyncHandler(async (req, res) => { apiResponse.success(res, 'Doctor detail',     await service.getById(req.params.id)); });
exports.getSlots         = asyncHandler(async (req, res) => { apiResponse.success(res, 'Available slots',   await service.getSlots(req.params.id, req.query.date)); });
exports.getByHospital    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Doctors fetched',   await service.getByHospital(req.user._id)); });
exports.addDoctor        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Doctor added',      await service.addDoctor(req.user._id, req.body), 201); });
exports.updateDoctor     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Doctor updated',    await service.updateDoctor(req.user._id, req.params.id, req.body)); });
exports.deleteDoctor     = asyncHandler(async (req, res) => { await service.deleteDoctor(req.user._id, req.params.id); apiResponse.success(res, 'Doctor removed'); });
exports.updateAvatar     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Avatar updated',    await service.updateAvatar(req.user._id, req.params.id, req.file)); });
exports.toggleAvailability = asyncHandler(async (req, res) => { apiResponse.success(res, 'Availability toggled', await service.toggleAvailability(req.user._id, req.params.id)); });
