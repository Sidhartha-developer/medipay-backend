const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User     = require('../models/User');
const Hospital = require('../models/Hospital');
const Admin    = require('../models/Admin');

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token provided', 401);

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  let user;
  if (decoded.role === 'patient')     user = await User.findById(decoded.id);
  if (decoded.role === 'hospital')    user = await Hospital.findById(decoded.id);
  if (decoded.role === 'super_admin') user = await Admin.findById(decoded.id);

  if (!user || !user.isActive) throw new AppError('Unauthorized', 401);
  req.user = user;
  req.role = decoded.role;
  next();
});

module.exports = authenticate;
