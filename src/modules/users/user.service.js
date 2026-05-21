const User         = require('../../models/User');
const FamilyMember = require('../../models/FamilyMember');
const Favorite     = require('../../models/Favorite');
const Appointment  = require('../../models/Appointment');
const AppError     = require('../../utils/AppError');
const paginate     = require('../../utils/pagination');
const { deleteImage } = require('../../services/cloudinaryService');

// ── Profile ────────────────────────────────────────────────────────────────
const getProfile = async (userId) => User.findById(userId).lean();

const updateProfile = async (userId, body) => {
  const allowed = ['name', 'phone', 'dateOfBirth', 'gender', 'bloodGroup', 'address'];
  const update  = {};
  allowed.forEach((k) => { if (body[k] !== undefined) update[k] = body[k]; });
  return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).lean();
};

const updateAvatar = async (userId, file) => {
  const user = await User.findById(userId);
  if (user.avatar?.publicId) await deleteImage(user.avatar.publicId);
  user.avatar = { url: file.path, publicId: file.filename };
  return user.save();
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new AppError('Current password is incorrect', 400);
  user.password = newPassword;
  return user.save();
};

// ── Family Members ─────────────────────────────────────────────────────────
const getFamilyMembers = async (userId) =>
  FamilyMember.find({ patient: userId }).lean();

const addFamilyMember = async (userId, body) =>
  FamilyMember.create({ patient: userId, ...body });

const updateFamilyMember = async (userId, memberId, body) => {
  const member = await FamilyMember.findOne({ _id: memberId, patient: userId });
  if (!member) throw new AppError('Family member not found', 404);
  Object.assign(member, body);
  return member.save();
};

const deleteFamilyMember = async (userId, memberId) => {
  const result = await FamilyMember.findOneAndDelete({ _id: memberId, patient: userId });
  if (!result) throw new AppError('Family member not found', 404);
};

// ── Favorites ──────────────────────────────────────────────────────────────
const getFavorites = async (userId) =>
  Favorite.find({ patient: userId }).populate('hospital', 'name logo address averageRating specializations').lean();

const addFavorite = async (userId, hospitalId) => {
  const exists = await Favorite.findOne({ patient: userId, hospital: hospitalId });
  if (exists) throw new AppError('Already in favorites', 409);
  return Favorite.create({ patient: userId, hospital: hospitalId });
};

const removeFavorite = async (userId, hospitalId) => {
  const result = await Favorite.findOneAndDelete({ patient: userId, hospital: hospitalId });
  if (!result) throw new AppError('Favorite not found', 404);
};

// ── Appointment history (patient-facing summary) ───────────────────────────
const getAppointmentHistory = async (userId, query) => {
  const filter = { patient: userId, status: { $in: ['completed', 'cancelled', 'rejected'] } };
  return paginate(Appointment, filter, {
    page: query.page, limit: query.limit,
    sort: { appointmentDate: -1 },
    populate: [
      { path: 'doctor',   select: 'name specialization avatar' },
      { path: 'hospital', select: 'name address logo' },
    ],
  });
};

module.exports = {
  getProfile, updateProfile, updateAvatar, changePassword,
  getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember,
  getFavorites, addFavorite, removeFavorite,
  getAppointmentHistory,
};
