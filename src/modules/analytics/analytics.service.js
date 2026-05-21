const Payment     = require('../../models/Payment');
const Appointment = require('../../models/Appointment');
const User        = require('../../models/User');
const Hospital    = require('../../models/Hospital');

const getDashboardOverview = async () => {
  const [users, hospitals, appointments, revenue] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Hospital.countDocuments({ isVerified: true }),
    Appointment.countDocuments({ status: 'completed' }),
    Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$commissionAmount' } } }]),
  ]);
  return { totalPatients: users, verifiedHospitals: hospitals, completedAppointments: appointments, adminRevenue: revenue[0]?.total || 0 };
};

const getMonthlyRevenue = async (year = new Date().getFullYear()) => {
  return Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) } } },
    { $group: { _id: { month: { $month: '$createdAt' } }, totalRevenue: { $sum: '$totalAmount' }, totalCommission: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } },
  ]);
};

const getTopHospitals = async (limit = 10) => {
  return Appointment.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    { $group: { _id: '$hospital', bookings: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    { $sort: { bookings: -1 } },
    { $limit: Number(limit) },
    { $lookup: { from: 'hospitals', localField: '_id', foreignField: '_id', as: 'hospital' } },
    { $unwind: '$hospital' },
    { $project: { 'hospital.password': 0 } },
  ]);
};

const getAppointmentTrends = async () => {
  return Appointment.aggregate([
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, status: '$status' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

module.exports = { getDashboardOverview, getMonthlyRevenue, getTopHospitals, getAppointmentTrends };
