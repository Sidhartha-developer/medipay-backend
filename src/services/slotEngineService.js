
const Slot = require('../models/Slot');

const timeToMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const minutesToTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const generateSlots = async ({ doctorId, hospitalId, date, startTime, endTime, duration = 30, breakStart, breakEnd }) => {
  const start  = timeToMinutes(startTime);
  const end    = timeToMinutes(endTime);
  const bStart = breakStart ? timeToMinutes(breakStart) : null;
  const bEnd   = breakEnd   ? timeToMinutes(breakEnd)   : null;

  const bookedSlots = await Slot.find({ doctor: doctorId, date, isBooked: true }).select('startTime').lean();
  const bookedStartTimes = new Set(bookedSlots.map((slot) => slot.startTime));
  const slots = [];
  for (let cur = start; cur + duration <= end; cur += duration) {
    if (bStart && bEnd && cur >= bStart && cur < bEnd) continue;
    const slotStartTime = minutesToTime(cur);
    if (bookedStartTimes.has(slotStartTime)) continue;
    slots.push({ doctor: doctorId, hospital: hospitalId, date, startTime: slotStartTime, endTime: minutesToTime(cur + duration), duration });
  }
  await Slot.deleteMany({ doctor: doctorId, date, isBooked: false });
  if (!slots.length) return [];
  return Slot.insertMany(slots);
};

module.exports = { generateSlots };
