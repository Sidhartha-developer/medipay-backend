const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./user.service');
const { uploadSingle } = require('../../middlewares/upload');

exports.getProfile    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Profile fetched',  await service.getProfile(req.user._id)); });
exports.updateProfile = asyncHandler(async (req, res) => { apiResponse.success(res, 'Profile updated',  await service.updateProfile(req.user._id, req.body)); });
exports.updateAvatar  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Avatar updated',   await service.updateAvatar(req.user._id, req.file)); });
exports.changePassword= asyncHandler(async (req, res) => { await service.changePassword(req.user._id, req.body); apiResponse.success(res, 'Password changed'); });

exports.getFamilyMembers   = asyncHandler(async (req, res) => { apiResponse.success(res, 'Family members', await service.getFamilyMembers(req.user._id)); });
exports.addFamilyMember    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Member added',   await service.addFamilyMember(req.user._id, req.body), 201); });
exports.updateFamilyMember = asyncHandler(async (req, res) => { apiResponse.success(res, 'Member updated', await service.updateFamilyMember(req.user._id, req.params.id, req.body)); });
exports.deleteFamilyMember = asyncHandler(async (req, res) => { await service.deleteFamilyMember(req.user._id, req.params.id); apiResponse.success(res, 'Member deleted'); });

exports.getFavorites   = asyncHandler(async (req, res) => { apiResponse.success(res, 'Favorites',       await service.getFavorites(req.user._id)); });
exports.addFavorite    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Added to favorites', await service.addFavorite(req.user._id, req.params.hospitalId), 201); });
exports.removeFavorite = asyncHandler(async (req, res) => { await service.removeFavorite(req.user._id, req.params.hospitalId); apiResponse.success(res, 'Removed from favorites'); });

exports.getAppointmentHistory = asyncHandler(async (req, res) => {
  const { data, meta } = await service.getAppointmentHistory(req.user._id, req.query);
  apiResponse.success(res, 'Appointment history', data, 200, meta);
});
