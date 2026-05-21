const router = require('express').Router();
const ctrl   = require('./hospital.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const { uploadSingle, uploadMultiple } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const { updateProfileSchema } = require('./hospital.validation');

// ── Public routes ─────────────────────────────────────────────────────────
router.get('/',                    ctrl.search);
router.get('/nearby',              ctrl.getNearby);
router.get('/:id',                 ctrl.getById);
router.get('/:id/doctors',         ctrl.getHospitalDoctors);
router.get('/:id/services',        ctrl.getHospitalServices);
router.get('/:id/reviews',         ctrl.getHospitalReviews);

// ── Hospital-only routes ──────────────────────────────────────────────────
router.use(authenticate, authorize('hospital'));

// Profile
router.get('/me/profile',                              ctrl.getProfile);
router.put('/me/profile',                              validate(updateProfileSchema), ctrl.updateProfile);
router.put('/me/profile/logo',   uploadSingle('hospitals','logo'),       ctrl.updateLogo);
router.post('/me/gallery',       uploadMultiple('gallery','images', 10), ctrl.uploadGallery);
router.delete('/me/gallery/:imageId',                  ctrl.removeGalleryImage);

// Dashboard & Earnings
router.get('/me/dashboard',                            ctrl.getDashboardStats);
router.get('/me/earnings',                             ctrl.getEarnings);

// Appointment management
router.get('/me/appointments',                         ctrl.getAppointments);
router.put('/me/appointments/:id/confirm',             ctrl.confirmAppointment);
router.put('/me/appointments/:id/reject',              ctrl.rejectAppointment);
router.put('/me/appointments/:id/complete',            ctrl.completeAppointment);

module.exports = router;
