const router = require('express').Router();
const ctrl   = require('./appointment.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const validate     = require('../../middlewares/validate');
const { bookSchema, cancelSchema, rescheduleSchema } = require('./appointment.validation');

router.use(authenticate);

router.post('/',                  authorize('patient'), validate(bookSchema),       ctrl.book);
router.get('/',                   authorize('patient'),           ctrl.getAll);
router.get('/upcoming',           authorize('patient'),           ctrl.upcoming);
router.get('/:id',                authorize('patient','hospital'),ctrl.getDetail);
router.put('/:id/cancel',         authorize('patient'), validate(cancelSchema),     ctrl.cancel);
router.put('/:id/reschedule',     authorize('patient'), validate(rescheduleSchema), ctrl.reschedule);

module.exports = router;
