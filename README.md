# Healthcare Marketplace — Backend API

Production-ready REST API for a hospital listing and appointment booking platform.

## Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT (Access + Refresh tokens)
- **Payments**: Razorpay
- **Notifications**: Firebase FCM + Nodemailer
- **Storage**: Cloudinary
- **Logging**: Winston + Morgan

## Roles
| Role | Description |
|------|-------------|
| `patient` | Mobile app users who book appointments |
| `hospital` | Hospital accounts managing doctors & slots |
| `super_admin` | Platform admin with full control |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and fill in values
cp .env.example .env

# 3. Start dev server
npm run dev

# 4. Health check
curl http://localhost:5000/api/v1/health
```

## API Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected routes require:
```
Authorization: Bearer <accessToken>
```

## Key Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/patient/register` | Patient signup |
| POST | `/auth/patient/login` | Patient login |
| POST | `/auth/hospital/login` | Hospital login |
| POST | `/auth/admin/login` | Admin login |
| POST | `/auth/forgot-password` | Send OTP |
| POST | `/auth/refresh-token` | Refresh access token |

### Hospitals (Public)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/hospitals?search=&city=&specialization=` | Search hospitals |
| GET | `/hospitals/nearby?lat=&lng=` | Geo-based search |
| GET | `/hospitals/:id` | Hospital detail |
| GET | `/hospitals/:id/doctors` | Hospital doctors |
| GET | `/hospitals/:id/reviews` | Hospital reviews |

### Appointments (Patient)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | My appointments |
| GET | `/appointments/upcoming` | Upcoming |
| PUT | `/appointments/:id/cancel` | Cancel |
| PUT | `/appointments/:id/reschedule` | Reschedule |

### Payments (Patient)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payments/create-order` | Create Razorpay order |
| POST | `/payments/verify` | Verify & confirm |
| GET | `/payments/history` | Payment history |
| POST | `/payments/webhook` | Razorpay webhook |

### Hospital Panel
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/hospitals/me/dashboard` | Stats |
| GET | `/hospitals/me/appointments` | All appointments |
| PUT | `/hospitals/me/appointments/:id/confirm` | Confirm |
| PUT | `/hospitals/me/appointments/:id/reject` | Reject |
| GET | `/hospitals/me/earnings` | Earnings |
| POST | `/slots/generate` | Generate slots |
| POST | `/slots/bulk-generate` | Bulk slots |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/admin/dashboard` | Platform stats |
| PUT | `/admin/hospitals/:id/verify` | Verify hospital |
| PUT | `/admin/hospitals/:id/commission` | Set commission |
| GET | `/admin/analytics/revenue` | Revenue data |
| POST | `/admin/notifications/broadcast` | Broadcast push |

## Payment Flow
1. Patient books appointment → `POST /appointments`
2. Server returns Razorpay `orderId`
3. Patient completes payment in app
4. App calls `POST /payments/verify` with signature
5. Server verifies HMAC, confirms appointment, locks slot
6. FCM + email sent to both parties

## Project Structure
```
src/
├── config/       — DB, Cloudinary, Firebase, Razorpay, Mailer
├── constants/    — Roles, statuses, commission defaults
├── middlewares/  — Auth, authorize, validate, upload, rate-limit, error handler
├── models/       — 13 Mongoose schemas
├── modules/      — Feature modules (routes + controller + service + validation)
├── services/     — Shared: FCM, email, Cloudinary, Razorpay, slot engine
├── utils/        — apiResponse, asyncHandler, AppError, pagination, logger
└── jobs/         — Cron: appointment reminder (runs every hour)
```

## Environment Variables
See `.env.example` for all required variables.

## Deployment (Render / Railway)
1. Push to GitHub
2. Connect repo in Render/Railway
3. Set all env vars from `.env.example`
4. Build: `npm install` | Start: `node server.js`
5. Add Razorpay webhook URL: `https://your-domain/api/v1/payments/webhook`
