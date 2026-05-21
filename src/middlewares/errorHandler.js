const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  if (err.name === 'CastError')         { statusCode = 400; message = 'Invalid ID format'; }
  if (err.code === 11000)               { statusCode = 409; message = `Duplicate: ${Object.keys(err.keyValue).join(', ')}`; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  if (process.env.NODE_ENV !== 'production') logger.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
module.exports = errorHandler;
