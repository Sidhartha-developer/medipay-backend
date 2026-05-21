const router = require('express').Router();
const ctrl   = require('./user.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize    = require('../../middlewares/authorize');
const { uploadSingle } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');
const { updateProfileSchema, changePasswordSchema, familyMemberSchema } = require('./user.validation');

router.use(authenticate, authorize('patient'));

// Profile
router.get('/profile',              ctrl.getProfile);
router.put('/profile',              validate(updateProfileSchema), ctrl.updateProfile);
router.put('/profile/avatar',       uploadSingle('avatars', 'avatar'), ctrl.updateAvatar);
router.put('/change-password',      validate(changePasswordSchema), ctrl.changePassword);

// Family Members
router.get('/family-members',       ctrl.getFamilyMembers);
router.post('/family-members',      validate(familyMemberSchema), ctrl.addFamilyMember);
router.put('/family-members/:id',   validate(familyMemberSchema), ctrl.updateFamilyMember);
router.delete('/family-members/:id',ctrl.deleteFamilyMember);

// Favorites
router.get('/favorites',                       ctrl.getFavorites);
router.post('/favorites/:hospitalId',          ctrl.addFavorite);
router.delete('/favorites/:hospitalId',        ctrl.removeFavorite);

// History
router.get('/appointment-history',  ctrl.getAppointmentHistory);

module.exports = router;
