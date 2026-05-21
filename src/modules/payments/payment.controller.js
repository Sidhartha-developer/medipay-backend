const asyncHandler = require('../../utils/asyncHandler');
const apiResponse  = require('../../utils/apiResponse');
const service      = require('./payment.service');

exports.createOrder    = asyncHandler(async (req, res) => { apiResponse.success(res, 'Order created',          await service.createPaymentOrder(req.user._id, req.body), 201); });
exports.verifyPayment  = asyncHandler(async (req, res) => { apiResponse.success(res, 'Payment verified. Appointment confirmed.', await service.verifyAndConfirm({ ...req.body, patientId: req.user._id })); });
exports.getHistory     = asyncHandler(async (req, res) => { const { data, meta } = await service.getPatientHistory(req.user._id, req.query); apiResponse.success(res, 'Payment history', data, 200, meta); });
exports.getDetail      = asyncHandler(async (req, res) => { apiResponse.success(res, 'Payment detail',          await service.getDetail(req.params.id, req.user._id, req.role)); });
exports.getHospitalSummary = asyncHandler(async (req, res) => { const result = await service.getHospitalSummary(req.user._id, req.query); apiResponse.success(res, 'Hospital payment summary', result); });

exports.webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  await service.handleWebhook(req.body, signature);
  res.json({ status: 'ok' });
});
