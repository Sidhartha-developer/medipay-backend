const router = require('express').Router();
const ctrl   = require('./review.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');

// Public
router.get('/hospital/:id', ctrl.getHospitalReviews);

// Patient only
router.use(authenticate, authorize('patient'));
router.post('/',          ctrl.submit);
router.get('/mine',       ctrl.getMyReviews);
router.put('/:id',        ctrl.editReview);
router.delete('/:id',     ctrl.deleteReview);

module.exports = router;
