const router = require('express').Router();
const ctrl   = require('./notification.controller');
const authenticate = require('../../middlewares/authenticate');

router.use(authenticate);
router.get('/',              ctrl.getMyNotifications);
router.put('/:id/read',     ctrl.markRead);
router.put('/read-all',     ctrl.markAllRead);

module.exports = router;
