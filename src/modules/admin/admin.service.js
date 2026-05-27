const User        = require('../../models/User');
const Hospital    = require('../../models/Hospital');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');
const Payment     = require('../../models/Payment');
const Review      = require('../../models/Review');
const Notification= require('../../models/Notification');
const AppError    = require('../../utils/AppError');
const paginate    = require('../../utils/pagination');
const { sendToMultiple } = require('../../services/fcmService');

// ── Users ──────────────────────────────────────────────────────────────────
const getAllUsers = async (query) => {
  const filter = {};
  if (query.search) filter.$or = [{ name: new RegExp(query.search, 'i') }, { email: new RegExp(query.search, 'i') }];
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return paginate(User, filter, { page: query.page, limit: query.limit });
};

const getUserById = async (id) => {
  const user = await User.findById(id).lean();
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  user.isActive = !user.isActive;
  return user.save();
};

// ── Hospitals ──────────────────────────────────────────────────────────────
const getAllHospitals = async (query) => {
  const filter = {};
  if (query.search)     filter.$text        = { $search: query.search };
  if (query.isVerified !== undefined) filter.isVerified   = query.isVerified === 'true';
  if (query.isActive !== undefined)   filter.isActive     = query.isActive   === 'true';
  return paginate(Hospital, filter, { page: query.page, limit: query.limit });
};

const getHospitalById = async (id) => {
  const h = await Hospital.findById(id).lean();
  if (!h) throw new AppError('Hospital not found', 404);
  return h;
};

const verifyHospital = async (id) => {
  const h = await Hospital.findById(id);
  if (!h) throw new AppError('Hospital not found', 404);
  h.isVerified = true;
  return h.save();
};

const toggleHospitalStatus = async (id) => {
  const h = await Hospital.findById(id);
  if (!h) throw new AppError('Hospital not found', 404);
  h.isActive = !h.isActive;
  return h.save();
};

const setCommissionRate = async (id, rate) => {
  if (rate < 0 || rate > 100) throw new AppError('Rate must be 0–100', 400);
  return Hospital.findByIdAndUpdate(id, { commissionRate: rate }, { new: true }).lean();
};

const getAllDoctors = async (query) => {
  const filter = { isActive: true,};

  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { specialization: new RegExp(query.search, 'i') },
    ];
  }

  return paginate(Doctor, filter, {
    page: query.page,
    limit: query.limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'hospital', select: 'name' },
    ],
  });
};

// ── Appointments ───────────────────────────────────────────────────────────
const getAllAppointments = async (query) => {
  const filter = {};
  if (query.status)     filter.status          = query.status;
  if (query.hospitalId) filter.hospital        = query.hospitalId;
  if (query.date) {
    const d = new Date(query.date);
    filter.appointmentDate = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
  }
  return paginate(Appointment, filter, {
    page: query.page, limit: query.limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'patient',  select: 'name email phone' },
      { path: 'hospital', select: 'name'             },
      { path: 'doctor',   select: 'name specialization' },
    ],
  });
};

// ── Payments ───────────────────────────────────────────────────────────────
const getAllPayments = async (query) => {
  const filter = {};
  if (query.status)     filter.status   = query.status;
  if (query.hospitalId) filter.hospital = query.hospitalId;
  return paginate(Payment, filter, {
    page: query.page, limit: query.limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'patient',     select: 'name email' },
      { path: 'hospital',    select: 'name'       },
      { path: 'appointment', select: 'appointmentDate appointmentTime' },
    ],
  });
};

const markSettlement = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.settledToHospital) throw new AppError('Already settled', 400);
  payment.settledToHospital = true;
  payment.settlementDate    = new Date();
  return payment.save();
};

// ── Reviews ────────────────────────────────────────────────────────────────
const getPendingReviews = async (query) =>
  paginate(Review, { isApproved: false, isHidden: false }, {
    page: query.page, limit: query.limit,
    populate: [
      { path: 'patient',  select: 'name' },
      { path: 'hospital', select: 'name' },
      { path: 'doctor',   select: 'name' },
    ],
  });

const approveReview = async (id) => {
  const review = await Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
  if (!review) throw new AppError('Review not found', 404);
  return review;
};

const hideReview = async (id) => {
  const review = await Review.findByIdAndUpdate(id, { isHidden: true, isApproved: false }, { new: true });
  if (!review) throw new AppError('Review not found', 404);
  return review;
};

// ── Notifications ──────────────────────────────────────────────────────────
const broadcastNotification = async ({ title, body, type = 'admin_announcement' }) => {
  const users   = await User.find({ isActive: true, fcmToken: { $exists: true, $ne: null } }).select('_id fcmToken').lean();
  const tokens  = users.map((u) => u.fcmToken).filter(Boolean);

  // Save to DB for each user
  const bulkOps = users.map((u) => ({
    insertOne: { document: { recipient: u._id, recipientModel: 'User', title, body, type, isSent: true } },
  }));
  if (bulkOps.length) await Notification.bulkWrite(bulkOps);

  // Send push in batches of 500 (FCM limit)
  for (let i = 0; i < tokens.length; i += 500) {
    await sendToMultiple(tokens.slice(i, i + 500), { notification: { title, body } });
  }

  return { sent: tokens.length };
};

// ── Dashboard summary ──────────────────────────────────────────────────────
const getDashboard = async () => {
  const today      = new Date(); today.setHours(0,0,0,0);
  const tomorrow   = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients, totalHospitals, pendingVerifications,
    todayAppointments, totalRevenue, pendingSettlements,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Hospital.countDocuments({ isVerified: true, isActive: true }),
    Hospital.countDocuments({ isVerified: false, isActive: true }),
    Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
    Payment.countDocuments({ status: 'completed', settledToHospital: false }),
  ]);

  return {
    totalPatients,
    totalHospitals,
    pendingVerifications,
    todayAppointments,
    adminRevenue:        totalRevenue[0]?.total || 0,
    pendingSettlements,
  };
};

module.exports = {
  getAllUsers, getUserById, toggleUserStatus,
  getAllHospitals, getHospitalById, getAllDoctors, verifyHospital, toggleHospitalStatus, setCommissionRate,
  getAllAppointments,
  getAllPayments, markSettlement,
  getPendingReviews, approveReview, hideReview,
  broadcastNotification,
  getDashboard,
};
