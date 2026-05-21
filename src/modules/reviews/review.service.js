const mongoose    = require('mongoose');
const Review      = require('../../models/Review');
const Appointment = require('../../models/Appointment');
const Hospital    = require('../../models/Hospital');
const Doctor      = require('../../models/Doctor');
const AppError    = require('../../utils/AppError');
const paginate    = require('../../utils/pagination');

const toId = (id) => new mongoose.Types.ObjectId(id);

// ── Submit ─────────────────────────────────────────────────────────────────
const submitReview = async (patientId, body) => {
  const { appointmentId, hospitalId, doctorId, rating, comment } = body;

  const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId, status: 'completed' });
  if (!appt)           throw new AppError('You can only review completed appointments', 400);
  if (appt.isReviewed) throw new AppError('You have already reviewed this appointment', 400);

  const review = await Review.create({
    patient: patientId, hospital: hospitalId,
    doctor: doctorId || undefined,
    appointment: appointmentId, rating, comment,
  });

  appt.isReviewed = true;
  await appt.save();

  await _recalcHospitalRating(hospitalId);
  if (doctorId) await _recalcDoctorRating(doctorId);

  return review;
};

// Cast to ObjectId so aggregate $match works correctly
const _recalcHospitalRating = async (hospitalId) => {
  const stats = await Review.aggregate([
    { $match: { hospital: toId(hospitalId), isApproved: true, isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await Hospital.findByIdAndUpdate(hospitalId, {
      averageRating: parseFloat(stats[0].avg.toFixed(1)),
      totalReviews:  stats[0].count,
    });
  }
};

const _recalcDoctorRating = async (doctorId) => {
  const stats = await Review.aggregate([
    { $match: { doctor: toId(doctorId), isApproved: true, isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats[0]) {
    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: parseFloat(stats[0].avg.toFixed(1)),
      totalReviews:  stats[0].count,
    });
  }
};

// ── Get hospital reviews (public, approved) ────────────────────────────────
const getHospitalReviews = async (hospitalId, query) =>
  paginate(Review, { hospital: hospitalId, isApproved: true, isHidden: false }, {
    page: query.page, limit: query.limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'patient', select: 'name avatar' },
      { path: 'doctor',  select: 'name specialization' },
    ],
  });

// ── Patient's own reviews ──────────────────────────────────────────────────
const getMyReviews = async (patientId, query) =>
  paginate(Review, { patient: patientId }, {
    page: query.page, limit: query.limit,
    populate: [
      { path: 'hospital', select: 'name logo' },
      { path: 'doctor',   select: 'name' },
    ],
  });

// ── Edit ───────────────────────────────────────────────────────────────────
const editReview = async (patientId, reviewId, body) => {
  const review = await Review.findOne({ _id: reviewId, patient: patientId });
  if (!review) throw new AppError('Review not found', 404);
  if (body.rating  !== undefined) review.rating  = body.rating;
  if (body.comment !== undefined) review.comment = body.comment;
  review.isApproved = false; // back to moderation queue on edit
  return review.save();
};

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteReview = async (patientId, reviewId) => {
  const review = await Review.findOneAndDelete({ _id: reviewId, patient: patientId });
  if (!review) throw new AppError('Review not found', 404);
  await _recalcHospitalRating(review.hospital);
  if (review.doctor) await _recalcDoctorRating(review.doctor);
};

module.exports = { submitReview, getHospitalReviews, getMyReviews, editReview, deleteReview };
