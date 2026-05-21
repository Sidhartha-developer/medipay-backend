const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(5000),
  API_VERSION: Joi.string().default('v1'),
  MONGODB_URI: Joi.string().uri({ scheme: [/mongodb(\+srv)?/] }).required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).invalid(Joi.ref('JWT_ACCESS_SECRET')).required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),
  FIREBASE_PROJECT_ID: Joi.string().allow('', null),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('', null),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('', null),
  MAIL_HOST: Joi.string().allow('', null),
  MAIL_PORT: Joi.number().port().default(587),
  MAIL_USER: Joi.string().allow('', null),
  MAIL_PASS: Joi.string().allow('', null),
  MAIL_FROM: Joi.string().allow('', null),
  ALLOWED_ORIGINS: Joi.string().allow('', null),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().integer().min(1).default(100),
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
  REQUEST_BODY_LIMIT: Joi.string().default('10kb'),
}).unknown(true);

const { value: env, error } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  const details = error.details.map((detail) => detail.message).join('; ');
  throw new Error(`Environment validation failed: ${details}`);
}

Object.assign(process.env, env);

module.exports = env;
