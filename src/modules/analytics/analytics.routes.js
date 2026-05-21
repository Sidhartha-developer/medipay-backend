const router = require('express').Router();
const ctrl   = require('./analytics.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');

router.use(authenticate, authorize('super_admin'));
router.get('/overview',              ctrl.overview);
router.get('/revenue',               ctrl.monthlyRevenue);
router.get('/top-hospitals',         ctrl.topHospitals);
router.get('/appointments/trends',   ctrl.appointmentTrends);

module.exports = router;
