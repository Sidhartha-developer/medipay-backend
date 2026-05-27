const router = require('express').Router();
const ctrl   = require('./admin.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');

router.use(authenticate, authorize('super_admin'));

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Users
router.get('/users',                   ctrl.getAllUsers);
router.get('/users/:id',               ctrl.getUserById);
router.put('/users/:id/toggle-status', ctrl.toggleUser);

// Hospitals
router.get('/hospitals',                          ctrl.getAllHospitals);
router.get('/hospitals/:id',                      ctrl.getHospitalById);
router.put('/hospitals/:id/verify',               ctrl.verifyHospital);
router.put('/hospitals/:id/toggle-status',        ctrl.toggleHospital);
router.put('/hospitals/:id/commission',           ctrl.setCommission);

// Appointments
router.get('/appointments', ctrl.getAllAppointments);

// Payments
router.get('/payments',          ctrl.getAllPayments);
router.post('/payments/:id/settle', ctrl.markSettlement);

// Reviews
router.get('/reviews',             ctrl.getPendingReviews);
router.put('/reviews/:id/approve', ctrl.approveReview);
router.put('/reviews/:id/hide',    ctrl.hideReview);

// Notifications
router.post('/notifications/broadcast', ctrl.broadcast);

module.exports = router;
