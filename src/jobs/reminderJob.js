const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { createAndSend } = require('../modules/notifications/notification.service');
const { sendEmail }     = require('../services/emailService');
const logger            = require('../utils/logger');

/**
 * Runs every hour — finds confirmed appointments within the next 24 hours
 * that haven't had a 24h reminder sent yet, then fires FCM + email.
 */
const startReminderJob = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('[ReminderJob] Running appointment reminder check...');
    try {
      const now      = new Date();
      const in24h    = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const appointments = await Appointment.find({
        status: 'confirmed',
        appointmentDate: { $gte: now, $lte: in24h },
        'reminders.type': { $ne: '24h' },
      })
        .populate('patient', 'name email fcmToken')
        .populate('doctor',  'name specialization')
        .populate('hospital','name');

      logger.info(`[ReminderJob] Found ${appointments.length} appointments needing reminder.`);

      for (const appt of appointments) {
        try {
          // FCM push
          if (appt.patient?.fcmToken) {
            await createAndSend({
              recipientId:    appt.patient._id,
              recipientModel: 'User',
              fcmToken:       appt.patient.fcmToken,
              title:          'Appointment Reminder – Tomorrow!',
              body:           `Your appointment with ${appt.doctor?.name} at ${appt.appointmentTime} is tomorrow.`,
              type:           'appointment_reminder',
              data:           { appointmentId: String(appt._id) },
            });
          }

          // Email
          if (appt.patient?.email) {
            await sendEmail({
              to:       appt.patient.email,
              subject:  'Reminder: Your Appointment is Tomorrow',
              template: 'appointmentReminder',
              data: {
                patientName: appt.patient.name,
                doctorName:  appt.doctor?.name,
                hospital:    appt.hospital?.name,
                date:        appt.appointmentDate.toDateString(),
                time:        appt.appointmentTime,
              },
            });
          }

          // Mark reminder as sent
          appt.reminders.push({ sentAt: new Date(), type: '24h' });
          await appt.save();
        } catch (innerErr) {
          logger.error(`[ReminderJob] Failed for appointment ${appt._id}:`, innerErr);
        }
      }
    } catch (err) {
      logger.error('[ReminderJob] Cron error:', err);
    }
  });

  logger.info('[ReminderJob] Appointment reminder cron scheduled (every hour).');
};

module.exports = { startReminderJob };
