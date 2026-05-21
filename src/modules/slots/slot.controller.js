const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./slot.service');

exports.getAvailable = asyncHandler(async (req, res) => { apiResponse.success(res, 'Available slots',  await service.getAvailableSlots(req.params.doctorId, req.query.date)); });
exports.generate     = asyncHandler(async (req, res) => { apiResponse.success(res, 'Slots generated',  await service.generate(req.user._id, req.body), 201); });
exports.bulkGenerate = asyncHandler(async (req, res) => { apiResponse.success(res, 'Bulk slots done',  await service.bulkGenerate(req.user._id, req.body), 201); });
exports.block        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Slot blocked',     await service.blockSlot(req.user._id, req.params.id)); });
exports.unblock      = asyncHandler(async (req, res) => { apiResponse.success(res, 'Slot unblocked',   await service.unblockSlot(req.user._id, req.params.id)); });
exports.deleteSlot   = asyncHandler(async (req, res) => { await service.deleteSlot(req.user._id, req.params.id); apiResponse.success(res, 'Slot deleted'); });
