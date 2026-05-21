const router       = require('express').Router();
const ctrl         = require('./auth.controller');
const validate     = require('../../middlewares/validate');
const authenticate = require('../../middlewares/authenticate');
const {
  registerPatientSchema, registerHospitalSchema,
  loginSchema, forgotPasswordSchema, resetPasswordSchema,
  refreshTokenSchema, fcmTokenSchema,
} = require('./auth.validation');

// Patient
router.post('/patient/register', validate(registerPatientSchema),  ctrl.registerPatient);
router.post('/patient/login',    validate(loginSchema),            ctrl.loginPatient);

// Hospital
router.post('/hospital/register', validate(registerHospitalSchema), ctrl.registerHospital);
router.post('/hospital/login',    validate(loginSchema),            ctrl.loginHospital);

// Admin
router.post('/admin/login',       validate(loginSchema),            ctrl.loginAdmin);

// Shared
router.post('/refresh-token',     validate(refreshTokenSchema),     ctrl.refreshToken);
router.post('/forgot-password',   validate(forgotPasswordSchema),   ctrl.forgotPassword);
router.post('/reset-password',    validate(resetPasswordSchema),    ctrl.resetPassword);
router.post('/update-fcm-token',  authenticate, validate(fcmTokenSchema), ctrl.updateFcmToken);

module.exports = router;
