const jwt      = require('jsonwebtoken');
const User     = require('../../models/User');
const Hospital = require('../../models/Hospital');
const Admin    = require('../../models/Admin');
const AppError = require('../../utils/AppError');
const generateTokens = require('../../utils/generateToken');
const { generateOTP, hashOTP, otpExpiry } = require('../../utils/otpHelper');
const { sendEmail } = require('../../services/emailService');

// ── Patient register ───────────────────────────────────────────────────────
const registerPatient = async (body) => {
  const exists = await User.findOne({ $or: [{ email: body.email }, { phone: body.phone }] });
  if (exists) throw new AppError('Email or phone already registered', 409);
  const user   = await User.create(body);
  const tokens = generateTokens({ id: user._id, role: 'patient', email: user.email });
  return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, ...tokens };
};

// ── Hospital register ──────────────────────────────────────────────────────
const registerHospital = async (body) => {
  const exists = await Hospital.findOne({ $or: [{ email: body.email }, { phone: body.phone }] });
  if (exists) throw new AppError('Email or phone already registered', 409);
  const hospital = await Hospital.create(body);
  // Do NOT return tokens — hospital must wait for admin verification
  return {
    hospital: { _id: hospital._id, name: hospital.name, email: hospital.email, isVerified: false },
    message: 'Registration submitted. Your hospital will be reviewed and activated by an admin.',
  };
};

// ── Patient login ──────────────────────────────────────────────────────────
const loginPatient = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Your account has been disabled. Contact support.', 403);
  const tokens = generateTokens({ id: user._id, role: 'patient', email: user.email });
  return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, ...tokens };
};

// ── Hospital login ─────────────────────────────────────────────────────────
const loginHospital = async ({ email, password }) => {
  const hospital = await Hospital.findOne({ email }).select('+password');
  if (!hospital || !(await hospital.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  if (!hospital.isActive)   throw new AppError('Your hospital account has been disabled.', 403);
  if (!hospital.isVerified) throw new AppError('Your hospital is pending admin verification.', 403);
  const tokens = generateTokens({ id: hospital._id, role: 'hospital', email: hospital.email });
  return {
    hospital: { _id: hospital._id, name: hospital.name, email: hospital.email, role: hospital.role, isVerified: hospital.isVerified },
    ...tokens,
  };
};

// ── Admin login ────────────────────────────────────────────────────────────
const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.comparePassword(password))) throw new AppError('Invalid email or password', 401);
  if (!admin.isActive) throw new AppError('Admin account disabled', 403);
  const tokens = generateTokens({ id: admin._id, role: 'super_admin', email: admin.email });
  return { admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }, ...tokens };
};

// ── Refresh token ──────────────────────────────────────────────────────────
const refreshToken = async (token) => {
  if (!token) throw new AppError('Refresh token required', 400);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }
  const newTokens = generateTokens({ id: decoded.id, role: decoded.role, email: decoded.email });
  return { accessToken: newTokens.accessToken };
};

// ── Forgot password ────────────────────────────────────────────────────────
const forgotPassword = async (email) => {
  const user = (await User.findOne({ email })) || (await Hospital.findOne({ email }));
  if (!user) throw new AppError('No account found with that email address', 404);
  const otp = generateOTP();
  user.resetPasswordToken   = hashOTP(otp);
  user.resetPasswordExpires = otpExpiry();
  await user.save({ validateBeforeSave: false });
  await sendEmail({ to: email, subject: 'Password Reset OTP', template: 'forgotPassword', data: { otp } });
  return { message: 'OTP sent to your registered email address' };
};

// ── Reset password ─────────────────────────────────────────────────────────
const resetPassword = async ({ email, otp, newPassword }) => {
  const hashedOtp = hashOTP(otp);
  const user = (await User.findOne({ email, resetPasswordToken: hashedOtp, resetPasswordExpires: { $gt: Date.now() } }).select('+password'))
            || (await Hospital.findOne({ email, resetPasswordToken: hashedOtp, resetPasswordExpires: { $gt: Date.now() } }).select('+password'));

  if (!user) throw new AppError('OTP is invalid or has expired', 400);
  user.password             = newPassword;
  user.resetPasswordToken   = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password reset successful. Please login with your new password.' };
};

// ── Update FCM token ───────────────────────────────────────────────────────
const updateFcmToken = async (user, fcmToken) => {
  user.fcmToken = fcmToken;
  await user.save({ validateBeforeSave: false });
  return { message: 'FCM token updated' };
};

module.exports = {
  registerPatient, registerHospital,
  loginPatient, loginHospital, loginAdmin,
  refreshToken, forgotPassword, resetPassword, updateFcmToken,
};
