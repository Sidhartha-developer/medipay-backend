const transporter = require('../config/mailer');
const logger = require('../utils/logger');

const templates = {
  bookingConfirmation: (d) => `<h2>Appointment Booked!</h2><p>Dear ${d.patientName}, your appointment with ${d.doctorName} on ${d.date} at ${d.time} has been received. Amount: ₹${d.amount}</p>`,
  appointmentConfirmed: (d) => `<h2>Appointment Confirmed!</h2><p>Dear ${d.patientName}, your appointment with ${d.doctorName} on ${d.date} at ${d.time} is confirmed.</p>`,
  appointmentReminder: (d) => `<h2>Reminder: Appointment Tomorrow</h2><p>Dear ${d.patientName}, you have an appointment with ${d.doctorName} tomorrow at ${d.time}.</p>`,
  paymentSuccess: (d) => `<h2>Payment Successful</h2><p>₹${d.amount} paid successfully. Transaction ID: ${d.transactionId}</p>`,
  appointmentCancelled: (d) => `<h2>Appointment Cancelled</h2><p>Dear ${d.patientName}, your appointment on ${d.date} has been cancelled. Reason: ${d.reason}</p>`,
  forgotPassword: (d) => `<h2>Password Reset OTP</h2><p>Your OTP is <strong>${d.otp}</strong>. Valid for 10 minutes.</p>`,
};

const sendEmail = async ({ to, subject, template, data }) => {

  const html = templates[template]
    ? templates[template](data)
    : data.html || '';

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });

  console.log('MAIL SENT INFO =>', info);

  return info;
};

module.exports = { sendEmail };
