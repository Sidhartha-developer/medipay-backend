const Slot     = require('../../models/Slot');
const Doctor   = require('../../models/Doctor');
const AppError = require('../../utils/AppError');
const { generateSlots } = require('../../services/slotEngineService');

// ── Public ─────────────────────────────────────────────────────────────────
const getAvailableSlots = async (doctorId, date) => {
  if (!date) throw new AppError('date query param is required (YYYY-MM-DD)', 400);
  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);
  return Slot.find({
    doctor: doctorId,
    date: { $gte: start, $lte: end },
    isBooked: false, isBlocked: false,
  }).sort({ startTime: 1 }).lean();
};

// ── Hospital only ──────────────────────────────────────────────────────────
const generate = async (hospitalId, body) => {
  const { doctorId, date, startTime, endTime, duration, breakStart, breakEnd } = body;
  const doctor = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doctor) throw new AppError('Doctor not found for this hospital', 404);
  return generateSlots({ doctorId, hospitalId, date, startTime, endTime, duration, breakStart, breakEnd });
};

const bulkGenerate = async (hospitalId, body) => {
  const { doctorId, startDate, endDate, startTime, endTime, duration, breakStart, breakEnd, excludeDays = [] } = body;

  const doctor = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doctor) throw new AppError('Doctor not found for this hospital', 404);

  const results  = [];
  const current  = new Date(startDate);
  const rangeEnd = new Date(endDate); // renamed from 'end' to avoid any shadowing

  while (current <= rangeEnd) {
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (!excludeDays.includes(dayName)) {
      const slots = await generateSlots({
        doctorId, hospitalId,
        date: new Date(current),
        startTime, endTime, duration, breakStart, breakEnd,
      });
      results.push(...slots);
    }
    current.setDate(current.getDate() + 1);
  }

  return { generated: results.length, message: `${results.length} slots generated across date range` };
};

const blockSlot = async (hospitalId, slotId) => {
  const slot = await Slot.findOne({ _id: slotId, hospital: hospitalId });
  if (!slot)          throw new AppError('Slot not found', 404);
  if (slot.isBooked)  throw new AppError('Slot is already booked and cannot be blocked', 400);
  slot.isBlocked = true;
  return slot.save();
};

const unblockSlot = async (hospitalId, slotId) => {
  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, hospital: hospitalId },
    { isBlocked: false },
    { new: true }
  );
  if (!slot) throw new AppError('Slot not found', 404);
  return slot;
};

const deleteSlot = async (hospitalId, slotId) => {
  const slot = await Slot.findOne({ _id: slotId, hospital: hospitalId });
  if (!slot)         throw new AppError('Slot not found', 404);
  if (slot.isBooked) throw new AppError('Cannot delete a booked slot', 400);
  return Slot.findByIdAndDelete(slotId);
};

module.exports = { getAvailableSlots, generate, bulkGenerate, blockSlot, unblockSlot, deleteSlot };
