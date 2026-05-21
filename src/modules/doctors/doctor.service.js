const Doctor   = require('../../models/Doctor');
const Slot     = require('../../models/Slot');
const AppError = require('../../utils/AppError');
const { deleteImage } = require('../../services/cloudinaryService');

// ── Public ─────────────────────────────────────────────────────────────────
const getById = async (id) => {
  const doc = await Doctor.findById(id).populate('hospital', 'name address logo').lean();
  if (!doc) throw new AppError('Doctor not found', 404);
  return doc;
};

const getSlots = async (doctorId, date) => {
  if (!date) throw new AppError('date query param required', 400);
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);
  return Slot.find({ doctor: doctorId, date: { $gte: start, $lte: end }, isBooked: false, isBlocked: false })
    .sort({ startTime: 1 }).lean();
};

// ── Hospital-only ──────────────────────────────────────────────────────────
const getByHospital = async (hospitalId) =>
  Doctor.find({ hospital: hospitalId, isActive: true }).lean();

const addDoctor = async (hospitalId, body) => {
  const exists = await Doctor.findOne({ hospital: hospitalId, name: body.name, specialization: body.specialization });
  if (exists) throw new AppError('Doctor already exists for this hospital', 409);
  return Doctor.create({ hospital: hospitalId, ...body });
};

const updateDoctor = async (hospitalId, doctorId, body) => {
  const doc = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doc) throw new AppError('Doctor not found', 404);
  const allowed = ['name', 'email', 'phone', 'specialization', 'qualification', 'experience', 'consultationFee', 'bio', 'languages'];
  allowed.forEach((k) => { if (body[k] !== undefined) doc[k] = body[k]; });
  return doc.save();
};

const deleteDoctor = async (hospitalId, doctorId) => {
  const doc = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doc) throw new AppError('Doctor not found', 404);
  doc.isActive = false;
  return doc.save();
};

const updateAvatar = async (hospitalId, doctorId, file) => {
  const doc = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doc) throw new AppError('Doctor not found', 404);
  if (doc.avatar?.publicId) await deleteImage(doc.avatar.publicId);
  doc.avatar = { url: file.path, publicId: file.filename };
  return doc.save();
};

const toggleAvailability = async (hospitalId, doctorId) => {
  const doc = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doc) throw new AppError('Doctor not found', 404);
  doc.isAvailable = !doc.isAvailable;
  return doc.save();
};

module.exports = { getById, getSlots, getByHospital, addDoctor, updateDoctor, deleteDoctor, updateAvatar, toggleAvailability };
