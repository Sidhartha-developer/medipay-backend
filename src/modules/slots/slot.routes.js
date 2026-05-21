const router = require('express').Router();
const ctrl   = require('./slot.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const validate     = require('../../middlewares/validate');
const { generateSchema, bulkGenerateSchema } = require('./slot.validation');

// Public
router.get('/doctor/:doctorId', ctrl.getAvailable);

// Hospital only
router.use(authenticate, authorize('hospital'));
router.post('/generate',        validate(generateSchema),     ctrl.generate);
router.post('/bulk-generate',   validate(bulkGenerateSchema), ctrl.bulkGenerate);
router.put('/:id/block',        ctrl.block);
router.put('/:id/unblock',      ctrl.unblock);
router.delete('/:id',           ctrl.deleteSlot);

module.exports = router;
