const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./review.service');

exports.submit              = asyncHandler(async (req, res) => { apiResponse.success(res, 'Review submitted. Pending moderation.', await service.submitReview(req.user._id, req.body), 201); });
exports.getHospitalReviews  = asyncHandler(async (req, res) => { const { data, meta } = await service.getHospitalReviews(req.params.id, req.query); apiResponse.success(res, 'Reviews', data, 200, meta); });
exports.getMyReviews        = asyncHandler(async (req, res) => { const { data, meta } = await service.getMyReviews(req.user._id, req.query); apiResponse.success(res, 'My reviews', data, 200, meta); });
exports.editReview          = asyncHandler(async (req, res) => { apiResponse.success(res, 'Review updated', await service.editReview(req.user._id, req.params.id, req.body)); });
exports.deleteReview        = asyncHandler(async (req, res) => { await service.deleteReview(req.user._id, req.params.id); apiResponse.success(res, 'Review deleted'); });
