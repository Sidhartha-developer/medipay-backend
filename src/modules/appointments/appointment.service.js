const Appointment = require('../../models/Appointment');
const Slot        = require('../../models/Slot');
const Doctor      = require('../../models/Doctor');
const Hospital    = require('../../models/Hospital');
const Payment     = require('../../models/Payment');
const AppError    = require('../../utils/AppError');
const paginate    = require('../../utils/pagination');
const logger      = require('../../utils/logger');
const { createOrder } = require('../../services/razorpayService');
const { createAndSend } = require('../notifications/notification.service');

// ── Book ───────────────────────────────────────────────────────────────────
const bookAppointment = async (patientId, body) => {
  const { doctorId, hospitalId, slotId, familyMemberId, symptoms, notes, appointmentDate, appointmentTime, serviceId } = body;

  const [doctor, hospital] = await Promise.all([
    Doctor.findById(doctorId),
    Hospital.findById(hospitalId).select('commissionRate isVerified isActive name fcmToken'),
  ]);

  if (!doctor || !doctor.isAvailable || !doctor.isActive) throw new AppError('Doctor is not available', 400);
  if (!hospital || !hospital.isVerified || !hospital.isActive) throw new AppError('Hospital is not accepting bookings', 400);

  const slot = await Slot.findOneAndUpdate(
    { _id: slotId, doctor: doctorId, hospital: hospitalId, isBooked: false, isBlocked: false },
    { $set: { isBooked: true } },
    { new: true }
  );
  if (!slot) throw new AppError('Slot is not available', 400);

  const totalAmount   = doctor.consultationFee;
  const advanceAmount = Math.ceil(totalAmount * 0.2); // 20% advance

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: patientId, hospital: hospitalId, doctor: doctorId, slot: slotId,
      service: serviceId || undefined,
      familyMember: familyMemberId || undefined,
      appointmentDate, appointmentTime, symptoms, notes,
      totalAmount, advanceAmount, remainingAmount: totalAmount - advanceAmount,
      status: 'pending',
    });

    await Slot.findByIdAndUpdate(slotId, { appointment: appointment._id });

    const order = await createOrder(advanceAmount, 'INR', `appt_${appointment._id}`);

    createAndSend({
      recipientId: hospitalId, recipientModel: 'Hospital',
      fcmToken: hospital.fcmToken,
      title: 'New Appointment Request',
      body: `A new appointment request has been received for ${doctor.name}.`,
      type: 'booking_confirmation',
      data: { appointmentId: String(appointment._id) },
    }).catch((err) => logger.error('Appointment notification failed:', err));

    return { appointment, razorpayOrder: { id: order.id, amount: order.amount, currency: order.currency } };
  } catch (err) {
    await Slot.findByIdAndUpdate(slotId, { isBooked: false, appointment: null });
    if (appointment?._id) await Appointment.findByIdAndDelete(appointment._id);
    throw err;
  }
};

// ── List (patient) ─────────────────────────────────────────────────────────
const getMyAppointments = async (patientId, query) => {
  const filter = { patient: patientId };
  if (query.status) filter.status = query.status;
  return paginate(Appointment, filter, {
    page: query.page, limit: query.limit,
    sort: { appointmentDate: -1 },
    populate: [
      { path: 'doctor',   select: 'name specialization avatar consultationFee' },
      { path: 'hospital', select: 'name address.city logo' },
      { path: 'slot',     select: 'startTime endTime' },
      { path: 'payment',  select: 'status totalAmount advancePaid' },
    ],
  });
};

// ── Detail ─────────────────────────────────────────────────────────────────
const getDetail = async (id, userId, role) => {
  const query = { _id: id };
  if (role === 'patient')  query.patient  = userId;
  if (role === 'hospital') query.hospital = userId;

  const appt = await Appointment.findOne(query)
    .populate('patient',      'name phone email avatar dateOfBirth bloodGroup')
    .populate('doctor',       'name specialization qualification experience consultationFee avatar')
    .populate('hospital',     'name address logo phone')
    .populate('slot',         'startTime endTime duration')
    .populate('familyMember', 'name relation dateOfBirth gender bloodGroup')
    .populate('payment',      'status totalAmount advancePaid remainingAmount razorpayPaymentId')
    .lean();

  if (!appt) throw new AppError('Appointment not found', 404);
  return appt;
};

// ── Cancel ─────────────────────────────────────────────────────────────────
const cancelAppointment = async (appointmentId, patientId, reason) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId }).populate('hospital', 'name fcmToken');
  if (!appt) throw new AppError('Appointment not found', 404);
  if (['completed', 'cancelled', 'rejected'].includes(appt.status)) throw new AppError(`Cannot cancel a ${appt.status} appointment`, 400);

  appt.status             = 'cancelled';
  appt.cancellationReason = reason || 'Cancelled by patient';
  await appt.save();

  // Free the slot back
  await Slot.findByIdAndUpdate(appt.slot, { isBooked: false, appointment: null });

  // Notify hospital
  if (appt.hospital?.fcmToken) {
    await createAndSend({
      recipientId: appt.hospital._id, recipientModel: 'Hospital',
      fcmToken: appt.hospital.fcmToken,
      title: 'Appointment Cancelled',
      body: `An appointment scheduled for ${appt.appointmentDate.toDateString()} has been cancelled by the patient.`,
      type: 'cancellation',
    });
  }
  return appt;
};

// ── Reschedule ─────────────────────────────────────────────────────────────
const rescheduleAppointment = async (appointmentId, patientId, { newSlotId, appointmentDate, appointmentTime }) => {
  const appt = await Appointment.findOne({ _id: appointmentId, patient: patientId });
  if (!appt) throw new AppError('Appointment not found', 404);
  if (!['pending', 'confirmed'].includes(appt.status)) throw new AppError(`Cannot reschedule a ${appt.status} appointment`, 400);

  const newSlot = await Slot.findOneAndUpdate(
    { _id: newSlotId, doctor: appt.doctor, hospital: appt.hospital, isBooked: false, isBlocked: false },
    { $set: { isBooked: true, appointment: appt._id } },
    { new: true }
  );
  if (!newSlot) throw new AppError('New slot is not available', 400);

  await Slot.findByIdAndUpdate(appt.slot, { isBooked: false, appointment: null });

  appt.slot            = newSlotId;
  appt.appointmentDate = appointmentDate;
  appt.appointmentTime = appointmentTime;
  appt.status          = 'pending'; // requires re-confirmation
  return appt.save();
};

// ── Upcoming ───────────────────────────────────────────────────────────────
const getUpcoming = async (patientId) => {
  const now = new Date();
  return Appointment.find({ patient: patientId, appointmentDate: { $gte: now }, status: { $in: ['pending', 'confirmed'] } })
    .sort({ appointmentDate: 1 })
    .limit(10)
    .populate('doctor',   'name specialization avatar')
    .populate('hospital', 'name address.city logo')
    .populate('slot',     'startTime endTime')
    .lean();
};

module.exports = { bookAppointment, getMyAppointments, getDetail, cancelAppointment, rescheduleAppointment, getUpcoming };
