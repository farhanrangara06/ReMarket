# ReMarket – Production Readiness Roadmap

This document tracks the phased plan to make ReMarket production-ready.

---

## Overview

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Production foundation & security baseline | ✅ Complete |
| **2** | httpOnly cookies + refresh token auth | ✅ Complete |
| **3** | Cloudinary cloud image hosting | ✅ Complete |
| **4** | Email verification & password reset | ✅ Complete |
| **5** | Cloud deployment (Atlas + Render + Vercel) | ✅ Complete |
| **6** | Razorpay payment integration | 🔲 Pending |
| **7** | Automated tests + CI/CD | 🔲 Pending |
| **8** | Legal pages, monitoring & logging | 🔲 Pending |

---

## Phase 1 – Production Foundation ✅

**Goal:** Harden the server for production deployment without breaking local dev.

### What was added
- `server/config/env.js` — validates required env vars on startup
- `server/config/cors.js` — strict CORS with multi-origin support
- `server/middleware/security.js` — Helmet, compression, rate limiting, mongo sanitize, HPP
- `server/utils/gracefulShutdown.js` — clean shutdown on SIGTERM/SIGINT
- Enhanced `/api/health` — returns 503 if DB is down
- `server/.env.production.example` — production env template
- `client/.env.example` — `VITE_API_URL` for deployed frontend
- Client API uses `VITE_API_URL` + `withCredentials` (ready for Phase 2 cookies)

### Packages added
`helmet`, `compression`, `express-rate-limit`, `express-mongo-sanitize`, `hpp`

### Rate limits (production)
| Route | Limit |
|-------|-------|
| All `/api/*` | 200 req / 15 min |
| Auth (login/register) | 15 req / 15 min |
| Uploads | 30 req / 15 min |

### Production env requirements
```
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=... (min 32 chars)
JWT_REFRESH_SECRET=... (min 32 chars, used in Phase 2)
CLIENT_URL=https://yourdomain.com
```

---

## Phase 2 – Secure Authentication ✅

**Goal:** Replace localStorage JWT with httpOnly cookies + refresh tokens.

### What was added
- `RefreshToken` model — hashed refresh tokens stored in MongoDB with rotation
- `server/services/authTokenService.js` — session create, refresh, revoke
- `server/utils/cookieUtils.js` — httpOnly, Secure, SameSite cookie config
- Access token: short-lived JWT in `accessToken` httpOnly cookie
- Refresh token: random 48-byte token in `refreshToken` httpOnly cookie (SHA-256 hashed in DB)
- `POST /api/auth/refresh` — rotates refresh token on each use
- `POST /api/auth/logout-all` — revoke all sessions for a user
- `protect` middleware reads cookie first, Bearer header as fallback (for API tools)
- Frontend: removed localStorage tokens; auto-refresh on 401 via Axios interceptor
- Login revokes all previous refresh tokens for that user

### Cookie settings
| Env | SameSite | Secure |
|-----|----------|--------|
| Development | `lax` | `false` |
| Production | `none` (configurable via `COOKIE_SAME_SITE`) | `true` |

### New endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/refresh` | Refresh access token using refresh cookie |
| POST | `/api/auth/logout-all` | Logout from all devices |

---

## Phase 3 – Cloudinary Image Hosting ✅

**Goal:** Replace local `uploads/` with cloud storage.

### What was added
- `server/config/cloudinary.js` — Cloudinary config + auto-detect from env vars
- `server/services/imageService.js` — unified upload/delete/resolve for local + Cloudinary
- `server/middleware/processUpload.js` — post-Multer processing pipeline
- Multer always uses memory buffers → saved to disk (local) or Cloudinary (when configured)
- Product/profile images stored as Cloudinary URLs in MongoDB when enabled
- Auto image optimization (`quality: auto`, `fetch_format: auto`)
- Delete removes images from Cloudinary or local disk
- Health check reports `storage: "cloudinary"` or `"local"`

### Enable Cloudinary
Add to `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Restart server — console shows: `Image storage: Cloudinary (your_cloud_name)`

Without these vars, local `server/uploads/` is used (no code changes needed).

### Free Cloudinary setup
1. Sign up at https://cloudinary.com
2. Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env` and restart server

---

## Phase 4 – Email System ✅

**Goal:** User verification and password recovery.

### What was added
- `server/config/email.js` — Nodemailer SMTP transporter (disabled when `SMTP_*` not set)
- `server/services/emailService.js` — HTML email templates for verify + reset
- `server/services/userTokenService.js` — secure token generation & hashing
- `server/utils/tokenUtils.js` — crypto helpers
- User model fields: `isEmailVerified`, verification/reset tokens + expiry
- Auth endpoints: `POST /verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`
- Frontend pages: `/verify-email`, `/forgot-password`, `/reset-password`
- Health check reports `email: "smtp"` or `"disabled"`

### Behaviour
| Mode | Register | Login | Password reset |
|------|----------|-------|----------------|
| **Dev (no SMTP)** | Auto-verified, logged in | Normal | Not available |
| **Production (SMTP set)** | Email sent, must verify first | Blocked until verified | Email reset link |

### Env vars
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

### Gmail setup
1. Enable 2FA on your Google account
2. Create an App Password at https://myaccount.google.com/apppasswords
3. Use that password as `SMTP_PASS`

### Test without SMTP
Register/login works normally in dev — verification links are printed to the server console.

---

## Phase 5 – Cloud Deployment ✅

**Goal:** Deploy to production infrastructure.

### Stack
| Service | Platform |
|---------|----------|
| Database | MongoDB Atlas |
| Backend API | Render |
| Frontend | Vercel |
| Images | Cloudinary |

### What was added
- `render.yaml` — Render Blueprint (one-click API deploy from GitHub)
- `client/vercel.json` — SPA routing + asset caching
- `client/.env.production.example` — frontend env template
- `DEPLOYMENT.md` — step-by-step Atlas + Render + Vercel guide
- `server/package.json` — Node `>=20` engine constraint

### Quick start
1. Create MongoDB Atlas cluster → copy `MONGO_URI`
2. Render → **New Blueprint** → connect repo → set env vars
3. Vercel → import `client/` → set `VITE_API_URL`
4. Update Render `CLIENT_URL` to your Vercel URL

Full instructions: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Phase 6 – Razorpay Payments

**Goal:** Enable real transactions for accepted purchase requests.

### Planned changes
- Razorpay order creation on request acceptance
- Payment verification webhook
- Order/payment model in MongoDB
- Payment status in purchase request workflow

---

## Phase 7 – Testing & CI/CD

**Goal:** Automated quality gates before deployment.

### Planned changes
- Jest/Vitest unit tests
- API integration test suite expansion
- GitHub Actions CI pipeline
- Pre-deploy health checks

---

## Phase 8 – Legal, Monitoring & Logging

**Goal:** Production operations and compliance.

### Planned changes
- Terms of Service & Privacy Policy pages
- Report product/user feature
- Winston structured logging
- Sentry error monitoring
- Uptime monitoring

---

## How to continue

Say **"Production Phase 6"** to add Razorpay payment integration.

Local development is unchanged — `npm run dev` works as before with `NODE_ENV=development`.
