const crypto = require('crypto');
const generateOTP  = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP      = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
const otpExpiry    = () => new Date(Date.now() + 10 * 60 * 1000); // 10 min
module.exports = { generateOTP, hashOTP, otpExpiry };
