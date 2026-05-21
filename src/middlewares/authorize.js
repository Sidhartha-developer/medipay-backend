const AppError = require('../utils/AppError');
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) throw new AppError('Forbidden: insufficient permissions', 403);
  next();
};
module.exports = authorize;
