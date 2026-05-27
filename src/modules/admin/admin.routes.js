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

// ─────────────────────────────────────────────────────────────
// Hospitals
// ─────────────────────────────────────────────────────────────

// 🔥 GET ALL HOSPITALS
router.get(
  '/hospitals',
  ctrl.getAllHospitals
);

// 🔥 GET SINGLE HOSPITAL
router.get(
  '/hospitals/:id',
  ctrl.getHospitalById
);

// 🔥 APPROVE HOSPITAL
router.put(
  '/hospitals/:id/approve',
  ctrl.approveHospital
);

// 🔥 REJECT HOSPITAL
router.put(
  '/hospitals/:id/reject',
  ctrl.rejectHospital
);

// 🔥 SUSPEND HOSPITAL
router.put(
  '/hospitals/:id/suspend',
  ctrl.suspendHospital
);

// 🔥 ACTIVATE / DEACTIVATE
router.put(
  '/hospitals/:id/toggle-status',
  ctrl.toggleHospital
);

// 🔥 UPDATE COMMISSION
router.put(
  '/hospitals/:id/commission',
  ctrl.setCommission
);

// 🔥 GET HOSPITAL DOCTORS
router.get(
  '/hospitals/:id/doctors',
  ctrl.getHospitalDoctors
);

// 🔥 GET HOSPITAL APPOINTMENTS
router.get(
  '/hospitals/:id/appointments',
  ctrl.getHospitalAppointments
);

// 🔥 GET HOSPITAL PAYMENTS
router.get(
  '/hospitals/:id/payments',
  ctrl.getHospitalPayments
);

// 🔥 GET FULL HOSPITAL PROFILE
router.get(
  '/hospitals/:id/full-profile',
  ctrl.getHospitalFullProfile
);

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
