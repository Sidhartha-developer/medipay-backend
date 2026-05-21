# Medipay Backend Audit

Date: 2026-05-21

## What Is Already Good

- The backend is already organized around feature modules with routes, controllers, services, validations, models, middleware, config, jobs, and shared services.
- Core production libraries are already present: Helmet, CORS, Mongo sanitize, XSS clean, HPP, rate limiting, Joi, Winston, Morgan, JWT, Razorpay, Firebase, Cloudinary, Jest, and Supertest.
- Business domains are separated clearly: auth, users, hospitals, doctors, slots, appointments, payments, reviews, notifications, analytics, and admin.
- Controllers are generally thin and service-driven.
- Passwords are hashed with bcrypt and excluded by default using `select: false`.
- Razorpay webhook raw-body middleware is correctly registered before JSON parsing.
- The codebase already uses `lean()` in many read paths and has baseline Mongo indexes.
- Health check, logs directory, cron job structure, and Render-style start script are already present.

## Weak Areas

- Joi schemas existed for several modules but most non-auth routes were not using them.
- Refresh tokens are stateless, so logout, token rotation, session revocation, and stolen-token invalidation are not currently enforceable.
- CORS previously fell back to wildcard origins while credentials were enabled.
- Environment variables were not validated at process startup.
- Pagination uses offset pagination everywhere, which can get expensive at high scale.
- Some aggregation `$match` stages used string ids against ObjectId fields.
- Notification sending is inline in several critical flows and can make business operations fail if FCM/email fails.
- Uploads still use `multer-storage-cloudinary`; a memory-storage plus explicit Cloudinary service is more controllable.
- Tests are configured, but no matching test files currently exist.
- Swagger/OpenAPI documentation is not present yet.

## Dangerous Issues

- Appointment booking had a race condition: two requests could read the same available slot before either request marked it booked.
- Reschedule checked a new slot but did not mark the new slot booked before moving the appointment.
- Payment signature comparisons used normal string equality instead of timing-safe comparison.
- Payment records lacked stronger uniqueness indexes for appointment/payment identifiers.
- The example env file contained a real-looking MongoDB Atlas URI with credentials and needed to be replaced with placeholders.
- Webhook handling updates payment status but is not yet a full idempotent event ledger.
- Password policy is only minimum length and should be upgraded for patient/hospital/admin account safety.

## Improvements Implemented In This Pass

- Added centralized startup environment validation.
- Hardened CORS origin handling and configurable request body limits.
- Added configurable rate-limit values with standard rate-limit headers.
- Upgraded validation middleware to support reusable request locations and strip unknown input.
- Wired existing validators into appointment, payment, slot, doctor, user, and hospital routes.
- Made appointment booking atomically claim the slot before appointment creation.
- Made rescheduling atomically claim the new slot and release the old slot.
- Prevented notification failures from failing successful appointment creation.
- Added timing-safe Razorpay payment and webhook signature comparisons.
- Fixed hospital payment aggregate matching with ObjectId conversion.
- Added stronger indexes for slots, appointments, and payment identifiers.
- Updated slot generation to skip already booked slot times before recreating availability.
- Removed exposed credentials from `.env.example`.
- Added graceful shutdown around the HTTP server.

## Recommended Next Phase

- Add persisted refresh-token sessions with rotation, logout, device metadata, and token reuse detection.
- Add reservation expiry for unpaid pending appointments and a cleanup job to release unpaid slots.
- Move notifications to an outbox/queue-ready abstraction so email, FCM, and future SMS are retried outside request latency.
- Replace `multer-storage-cloudinary` with multer memory storage and explicit Cloudinary upload service validation.
- Add Razorpay webhook event storage with idempotency keys and full failed-payment slot release behavior.
- Add OpenAPI docs and keep them route-driven.
- Add Jest/Supertest integration tests for auth, appointment booking race behavior, and payment verification.
- Add compression once the dependency can be installed.
