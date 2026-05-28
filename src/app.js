require('dotenv').config();
require('./config/env');
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss     = require('xss-clean');
const hpp     = require('hpp');
const morgan  = require('morgan');
const logger  = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');

// Route imports
const authRoutes         = require('./modules/auth/auth.routes');
const userRoutes         = require('./modules/users/user.routes');
const hospitalRoutes     = require('./modules/hospitals/hospital.routes');
const doctorRoutes       = require('./modules/doctors/doctor.routes');
const appointmentRoutes  = require('./modules/appointments/appointment.routes');
const slotRoutes         = require('./modules/slots/slot.routes');
const paymentRoutes      = require('./modules/payments/payment.routes');
const reviewRoutes       = require('./modules/reviews/review.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const analyticsRoutes    = require('./modules/analytics/analytics.routes');
const adminRoutes        = require('./modules/admin/admin.routes');
const testRoutes = require('../test.routes');

const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// ── HTTP request logger ────────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Razorpay webhook MUST receive raw body for HMAC verification ───────────
// CRITICAL: register this BEFORE express.json() or signature check will fail
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// ── Body parsers (all other routes) ───────────────────────────────────────
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '10kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '10kb' }));

// ── Security middleware ────────────────────────────────────────────────────
app.use(mongoSanitize()); // prevent NoSQL injection
app.use(xss());           // sanitize HTML tags
app.use(hpp());           // prevent HTTP param pollution

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter);
app.use('/api/',        apiLimiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// ── Routes ─────────────────────────────────────────────────────────────────
const BASE = '/api/v1';
app.use(`${BASE}/auth`,          authRoutes);
app.use(`${BASE}/users`,         userRoutes);
app.use(`${BASE}/hospitals`,     hospitalRoutes);
app.use(`${BASE}/doctors`,       doctorRoutes);
app.use(`${BASE}/appointments`,  appointmentRoutes);
app.use(`${BASE}/slots`,         slotRoutes);
app.use(`${BASE}/payments`,      paymentRoutes);
app.use(`${BASE}/reviews`,       reviewRoutes);
app.use(`${BASE}/notifications`, notificationRoutes);
app.use(`${BASE}/analytics`,     analyticsRoutes);
app.use(`${BASE}/admin`,         adminRoutes);
app.use(`${BASE}/test`, testRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
