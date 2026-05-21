const Hospital    = require('../../models/Hospital');
const Appointment = require('../../models/Appointment');
const Payment     = require('../../models/Payment');
const Doctor      = require('../../models/Doctor');
const Service     = require('../../models/Service');
const Review      = require('../../models/Review');
const AppError    = require('../../utils/AppError');
const paginate    = require('../../utils/pagination');
const { deleteImage } = require('../../services/cloudinaryService');
const { createAndSend } = require('../notifications/notification.service');

// ── Public ─────────────────────────────────────────────────────────────────
const searchHospitals = async (query) => {
  const { search, city, specialization, minRating, isVerified, page = 1, limit = 10, sortBy = 'averageRating', order = 'desc' } = query;
  const filter = { isActive: true };
  if (search)         filter.$text            = { $search: search };
  if (city)           filter['address.city']  = new RegExp(city, 'i');
  if (specialization) filter.specializations  = specialization;
  if (minRating)      filter.averageRating    = { $gte: parseFloat(minRating) };
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  return paginate(Hospital, filter, { page, limit, sort });
};

const getNearby = async ({ lng, lat, maxDistance = 10000 }) => {
  if (!lng || !lat) throw new AppError('lng and lat query params required', 400);
  return Hospital.find({
    isActive: true, isVerified: true,
    'address.coordinates': {
      $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(maxDistance) },
    },
  }).limit(20).lean();
};

const getById = async (id) => {
  const h = await Hospital.findById(id).lean();
  if (!h) throw new AppError('Hospital not found', 404);
  return h;
};

const getHospitalDoctors = async (hospitalId) =>
  Doctor.find({ hospital: hospitalId, isActive: true }).lean();

const getHospitalServices = async (hospitalId) =>
  Service.find({ hospital: hospitalId, isActive: true }).lean();

const getHospitalReviews = async (hospitalId, query) =>
  paginate(Review, { hospital: hospitalId, isApproved: true, isHidden: false }, {
    page: query.page, limit: query.limit,
    populate: [{ path: 'patient', select: 'name avatar' }, { path: 'doctor', select: 'name' }],
  });

// ── Hospital self-management ───────────────────────────────────────────────
const getProfile = async (hospitalId) => {
  const h = await Hospital.findById(hospitalId).lean();
  if (!h) throw new AppError('Hospital not found', 404);
  return h;
};

const updateProfile = async (hospitalId, body) => {
  const allowed = ['name', 'phone', 'description', 'specializations', 'facilities', 'address', 'timings', 'bankDetails'];
  const update  = {};
  allowed.forEach((k) => { if (body[k] !== undefined) update[k] = body[k]; });
  return Hospital.findByIdAndUpdate(hospitalId, update, { new: true, runValidators: true }).lean();
};

const updateLogo = async (hospitalId, file) => {
  const hospital = await Hospital.findById(hospitalId);
  if (hospital.logo?.publicId) await deleteImage(hospital.logo.publicId);
  hospital.logo = { url: file.path, publicId: file.filename };
  return hospital.save();
};

const uploadGalleryImage = async (hospitalId, files) => {
  const images = files.map((f) => ({ url: f.path, publicId: f.filename }));
  return Hospital.findByIdAndUpdate(hospitalId, { $push: { gallery: { $each: images } } }, { new: true }).lean();
};

const removeGalleryImage = async (hospitalId, imageId) => {
  const hospital = await Hospital.findById(hospitalId);
  const image    = hospital.gallery.id(imageId);
  if (!image) throw new AppError('Image not found', 404);
  await deleteImage(image.publicId);
  hospital.gallery.pull(imageId);
  return hospital.save();
};

// ── Appointment management ─────────────────────────────────────────────────
const getAppointments = async (hospitalId, query) => {
  const filter = { hospital: hospitalId };
  if (query.status) filter.status = query.status;
  if (query.date) {
    const d = new Date(query.date);
    filter.appointmentDate = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
  }
  return paginate(Appointment, filter, {
    page: query.page, limit: query.limit,
    sort: { appointmentDate: 1 },
    populate: [
      { path: 'patient', select: 'name phone email avatar' },
      { path: 'doctor',  select: 'name specialization'     },
      { path: 'slot',    select: 'startTime endTime'        },
    ],
  });
};

const confirmAppointment = async (hospitalId, appointmentId) => {
  const appt = await Appointment.findOne({ _id: appointmentId, hospital: hospitalId });
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.status !== 'pending') throw new AppError(`Cannot confirm a ${appt.status} appointment`, 400);
  appt.status = 'confirmed';
  await appt.save();
  await createAndSend({ recipientId: appt.patient, recipientModel: 'User', title: 'Appointment Confirmed', body: 'Your appointment has been confirmed by the hospital.', type: 'booking_confirmation' });
  return appt;
};

const rejectAppointment = async (hospitalId, appointmentId, reason) => {
  const appt = await Appointment.findOne({ _id: appointmentId, hospital: hospitalId });
  if (!appt) throw new AppError('Appointment not found', 404);
  if (!['pending', 'confirmed'].includes(appt.status)) throw new AppError(`Cannot reject a ${appt.status} appointment`, 400);
  appt.status          = 'rejected';
  appt.rejectionReason = reason;
  await appt.save();
  await createAndSend({ recipientId: appt.patient, recipientModel: 'User', title: 'Appointment Rejected', body: `Your appointment was rejected. Reason: ${reason}`, type: 'cancellation' });
  return appt;
};

const completeAppointment = async (hospitalId, appointmentId) => {
  const appt = await Appointment.findOne({ _id: appointmentId, hospital: hospitalId });
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.status !== 'confirmed') throw new AppError('Only confirmed appointments can be completed', 400);
  appt.status = 'completed';
  return appt.save();
};

// ── Earnings ───────────────────────────────────────────────────────────────
const getEarnings = async (hospitalId, query) => {
  const { period = 'monthly', year = new Date().getFullYear() } = query;
  const match = { hospital: hospitalId, status: 'completed', createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) } };

  const groupBy = period === 'daily'
    ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }
    : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

  const revenue = await Payment.aggregate([
    { $match: match },
    { $group: { _id: groupBy, gross: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' }, net: { $sum: '$hospitalReceivable' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const summary = await Payment.aggregate([
    { $match: { hospital: hospitalId, status: 'completed' } },
    { $group: { _id: null, totalGross: { $sum: '$totalAmount' }, totalNet: { $sum: '$hospitalReceivable' }, totalCommission: { $sum: '$commissionAmount' }, pendingSettlement: { $sum: { $cond: [{ $eq: ['$settledToHospital', false] }, '$hospitalReceivable', 0] } } } },
  ]);

  return { breakdown: revenue, summary: summary[0] || {} };
};

// ── Dashboard stats ────────────────────────────────────────────────────────
const getDashboardStats = async (hospitalId) => {
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const [total, todayCount, pending, doctors, revenue] = await Promise.all([
    Appointment.countDocuments({ hospital: hospitalId }),
    Appointment.countDocuments({ hospital: hospitalId, appointmentDate: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ hospital: hospitalId, status: 'pending' }),
    Doctor.countDocuments({ hospital: hospitalId, isActive: true }),
    Payment.aggregate([{ $match: { hospital: hospitalId, status: 'completed' } }, { $group: { _id: null, net: { $sum: '$hospitalReceivable' } } }]),
  ]);

  return { totalAppointments: total, todayAppointments: todayCount, pendingAppointments: pending, activeDoctors: doctors, totalEarnings: revenue[0]?.net || 0 };
};

module.exports = {
  searchHospitals, getNearby, getById, getHospitalDoctors, getHospitalServices, getHospitalReviews,
  getProfile, updateProfile, updateLogo, uploadGalleryImage, removeGalleryImage,
  getAppointments, confirmAppointment, rejectAppointment, completeAppointment,
  getEarnings, getDashboardStats,
};
