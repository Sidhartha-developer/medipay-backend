const express = require('express');
const router = express.Router();

const { sendEmail } = require('./src/services/emailService');
router.get('/test-mail', async (req, res) => {
  try {
    await sendEmail({
      to: 'YOUR_REAL_EMAIL@gmail.com',
      subject: 'Medipay Mail Test',
      template: 'paymentSuccess',
      data: {
        amount: 500,
        transactionId: 'TXN123456',
      },
    });

    return res.json({
      success: true,
      message: 'Mail sent successfully',
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;