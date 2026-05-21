const router = require('express').Router();
const ctrl   = require('./doctor.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const { uploadSingle } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const { addDoctorSchema, updateDoctorSchema } = require('./doctor.validation');

// Public
router.get('/:id',       ctrl.getById);
router.get('/:id/slots', ctrl.getSlots);

// Hospital only
router.use(authenticate, authorize('hospital'));
router.get('/',                            ctrl.getByHospital);
router.post('/',                           validate(addDoctorSchema),    ctrl.addDoctor);
router.put('/:id',                         validate(updateDoctorSchema), ctrl.updateDoctor);
router.delete('/:id',                      ctrl.deleteDoctor);
router.put('/:id/avatar', uploadSingle('doctors', 'avatar'), ctrl.updateAvatar);
router.put('/:id/availability',            ctrl.toggleAvailability);

module.exports = router;
