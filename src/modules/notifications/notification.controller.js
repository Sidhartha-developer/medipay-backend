const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./notification.service');

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const { data, meta } = await service.getMyNotifications(req.user._id, req.query);
  apiResponse.success(res, 'Notifications fetched', data, 200, meta);
});

exports.markRead = asyncHandler(async (req, res) => {
  await service.markRead(req.params.id, req.user._id);
  apiResponse.success(res, 'Marked as read');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await service.markAllRead(req.user._id);
  apiResponse.success(res, 'All notifications marked as read');
});
