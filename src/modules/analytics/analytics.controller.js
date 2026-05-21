const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./analytics.service');

exports.overview        = asyncHandler(async (req, res) => { apiResponse.success(res, 'Overview', await service.getDashboardOverview()); });
exports.monthlyRevenue  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Revenue', await service.getMonthlyRevenue(req.query.year)); });
exports.topHospitals    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Top hospitals', await service.getTopHospitals(req.query.limit)); });
exports.appointmentTrends = asyncHandler(async (req, res) => { apiResponse.success(res, 'Trends', await service.getAppointmentTrends()); });
