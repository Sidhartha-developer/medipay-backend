const jwt = require('jsonwebtoken');
const generateTokens = (payload) => ({
  accessToken:  jwt.sign(payload, process.env.JWT_ACCESS_SECRET,  { expiresIn: process.env.JWT_ACCESS_EXPIRY  || '15m' }),
  refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'  }),
});
module.exports = generateTokens;
