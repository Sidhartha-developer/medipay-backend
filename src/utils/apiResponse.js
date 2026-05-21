const success = (res, message, data = null, statusCode = 200, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};
const error = (res, message, statusCode = 500, details = null) =>
  res.status(statusCode).json({ success: false, message, details });

module.exports = { success, error };
