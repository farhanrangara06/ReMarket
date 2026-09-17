# ReMarket – Used Products Buying & Selling System

A full-stack MERN marketplace where users can sell used products they no longer need, and other users can browse, search, filter, and send purchase requests for available items.

**College Project:** Practical No. 10 – MERN Stack Web Application

---

## Features

- User registration and login with JWT authentication
- Browse, search, filter, sort, and paginate products
- Product CRUD with image upload (Multer)
- Wishlist management
- Purchase request workflow (send, accept, reject, cancel, complete)
- In-app notification system with unread count
- User dashboard with statistics
- Profile update and password change
- Admin dashboard (users, products, categories, statistics)
- Responsive UI with loading, empty, and error states
- Toast notifications and role-based access control

---

## Technology Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4, Axios, Lucide  |
| Backend    | Node.js, Express.js, REST API                   |
| Database   | MongoDB, Mongoose ODM                           |
| Auth       | JWT, bcryptjs                                   |
| Uploads    | Multer (local storage in `server/uploads/`)     |

---

## System Architecture

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     Mongoose     ┌─────────────┐
│   React     │ ◄──────────────►  │   Express   │ ◄──────────────► │   MongoDB   │
│  (Vite)     │    /api proxy     │   Server    │                  │  Database   │
│  :5173      │                   │   :5000     │                  │  :27017     │
└─────────────┘                   └─────────────┘                  └─────────────┘
```

The React frontend communicates with the Express backend via Axios. Vite proxies `/api` and `/uploads` to the backend during development.

---

## Project Structure

```
ReMarket/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages (+ admin/)
│   │   ├── layouts/           # MainLayout, AdminLayout
│   │   ├── hooks/             # useWishlist, useNotifications
│   │   ├── services/          # Axios API services
│   │   ├── context/           # AuthContext, ToastContext
│   │   └── utils/             # Constants, helpers
│   └── vite.config.js
├── server/                    # Express backend
│   ├── config/                # DB, upload config
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth, upload, errors
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic
│   ├── utils/                 # Helpers, seed, tests
│   ├── uploads/               # Uploaded images
│   └── server.js
├── README.md
├── JOURNAL.md
├── JOURNAL_CODE.md
├── SCREENSHOTS.md
├── VIVA.md
├── DEMO_FLOW.md
├── PROJECT_REPORT.md
└── LINKEDIN_POST.md
```

---

## Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas)
- npm

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ReMarket

# Server setup
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Client setup
cd ../client
npm install
```

---

## Environment Variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/remarket
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> Never commit `.env` to version control.

---

## How to Run

```bash
# Terminal 1 – Start MongoDB (if using local)
# Windows (Admin): Start-Service MongoDB

# Terminal 2 – Backend
cd server
npm run dev

# Terminal 3 – Frontend
cd client
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health check:** http://localhost:5000/api/health

---

## Seed Demo Data

```bash
cd server
npm run seed
```

This creates demo users, categories, products, purchase requests, and notifications.

> **DEVELOPMENT ONLY** — Demo credentials are printed after seeding. Do not use in production.

---

## API Overview

| Prefix              | Description                          |
|---------------------|--------------------------------------|
| `/api/auth`         | Register, login, logout, get current user |
| `/api/products`     | Product CRUD, search, filter, pagination |
| `/api/users`        | Profile, password, dashboard stats   |
| `/api/requests`     | Purchase request lifecycle           |
| `/api/wishlist`     | Add, remove, list wishlist items     |
| `/api/notifications`| List, unread count, mark read        |
| `/api/admin`        | Admin dashboard and management       |

---

## User Roles

| Role  | Capabilities                                              |
|-------|-----------------------------------------------------------|
| User  | Buy and sell — browse, wishlist, requests, list products  |
| Admin | Platform management — users, products, categories, stats |

A normal registered user can act as both buyer and seller.

---

## Database Collections

| Collection         | Purpose                              |
|--------------------|--------------------------------------|
| `users`            | User accounts, roles, wishlist       |
| `products`         | Product listings with images         |
| `purchaserequests` | Buyer-seller purchase requests       |
| `notifications`    | In-app notifications               |
| `categories`       | Admin-managed product categories     |

---

## Cloud Deployment

Deploy to production with **MongoDB Atlas + Render + Vercel**:

1. **Atlas** — create a free cluster and copy `MONGO_URI`
2. **Render** — connect GitHub repo, use `render.yaml` Blueprint
3. **Vercel** — deploy the `client/` folder, set `VITE_API_URL`

Full step-by-step guide: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Testing

```bash
# API integration tests (server must be running)
cd server
npm run test:api

# Frontend production build
cd client
npm run build
```

---

## Screenshots

See [SCREENSHOTS.md](./SCREENSHOTS.md) for the full screenshot checklist required for journal submission.

---

## Future Enhancements

- Payment gateway integration (Razorpay — Phase 6)
- Real-time chat between buyer and seller
- Product reviews and ratings
- Advanced analytics dashboard

---

## Author

College Practical No. 10 – MERN Stack Project

---

## License

ISC
