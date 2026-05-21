const router = require('express').Router();
const ctrl   = require('./payment.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const validate     = require('../../middlewares/validate');
const { createOrderSchema, verifySchema } = require('./payment.validation');

// Webhook — raw body, no auth (signature verified inside service)
router.post('/webhook', ctrl.webhook);

router.use(authenticate);
router.post('/create-order',     authorize('patient'), validate(createOrderSchema), ctrl.createOrder);
router.post('/verify',           authorize('patient'), validate(verifySchema),      ctrl.verifyPayment);
router.get('/history',           authorize('patient'),           ctrl.getHistory);
router.get('/hospital/summary',  authorize('hospital'),          ctrl.getHospitalSummary);
router.get('/:id',               authorize('patient','hospital'),ctrl.getDetail);

module.exports = router;
