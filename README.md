# 🏠 HomeHaven 2.0

A modern, production-ready real estate platform built with the MERN stack.

## Tech Stack

**Frontend** — React 18, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios, React Hook Form + Zod, Framer Motion, Lucide React, React Hot Toast

**Backend** — Node.js, Express, MongoDB, Mongoose, JWT (httpOnly cookies), bcrypt

**Storage** — Firebase Storage (for property/avatar images)

## Project Structure

```
Homehaven/
├── client/                  # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── app/             # Redux store
│       ├── components/
│       │   ├── common/      # ErrorBoundary, ProtectedRoute, ThemeToggle…
│       │   ├── layout/      # Navbar, Footer, RootLayout, AuthLayout
│       │   └── ui/          # Button, Input (design system primitives)
│       ├── features/
│       │   └── auth/        # authSlice + authThunks
│       ├── lib/             # axios, firebase, zod schemas, utils
│       ├── pages/           # Home, About, Contact, Login, Register, Profile, 404
│       ├── providers/       # ThemeProvider (dark/light), ToastProvider
│       └── routes/          # React Router config
└── server/                  # Express API
    └── src/
        ├── config/          # env + MongoDB connection
        ├── controllers/     # authController
        ├── middleware/      # auth (JWT), errorHandler, notFound
        ├── models/          # User
        ├── routes/          # /api/auth
        └── utils/           # ApiError, asyncHandler, token helpers
```

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas URI)

### Setup

```bash
# Install all dependencies
npm install
npm install --prefix client
npm install --prefix server

# Configure the server
cp server/.env.example server/.env   # then edit values

# Run frontend + backend together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000 (proxied at `/api` from the client)

### Environment Variables

**server/.env**

| Variable | Description |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Allowed CORS origin (default `http://localhost:5173`) |

**client/.env** (optional — copy from `client/.env.example`)

Firebase keys are only needed for image uploads; the app runs without them.

## API Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/health` | Health check | — |
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Log in | — |
| POST | `/api/auth/logout` | Log out (clears cookie) | — |
| GET | `/api/auth/me` | Current user | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |
| GET | `/api/properties` | List with `q, type, status, city, minPrice, maxPrice, beds, baths, ids, sort, page, limit` | — |
| GET | `/api/properties/featured` | Featured listings | — |
| GET | `/api/properties/meta` | Filter metadata (types, statuses, cities, amenities) | — |
| GET | `/api/properties/:id` | Property details (+1 view) | — |
| GET | `/api/properties/:id/similar` | Similar listings | — |
| POST | `/api/properties` | Create listing | ✅ |
| PUT | `/api/properties/:id` | Update listing (owner/admin) | ✅ |
| DELETE | `/api/properties/:id` | Delete listing (owner/admin) | ✅ |
| GET | `/api/properties/user/me` | My listings | ✅ |
| POST | `/api/properties/:id/contact` | Contact seller (creates inquiry) | — |
| GET | `/api/properties/inquiries/me` | Inquiries for my listings | ✅ |
| GET | `/api/favorites` | My wishlist | ✅ |
| POST | `/api/favorites/:propertyId` | Toggle favorite | ✅ |
| PUT | `/api/auth/password` | Change password | ✅ |
| GET | `/api/users/dashboard` | My dashboard stats (listings, views, inquiries, charts) | ✅ |
| GET/POST | `/api/users/saved-searches` | List / save a search | ✅ |
| DELETE | `/api/users/saved-searches/:id` | Delete saved search | ✅ |
| GET | `/api/notifications` | My notifications (+unread count) | ✅ |
| PUT | `/api/notifications/:id/read`, `/read-all` | Mark read | ✅ |
| DELETE | `/api/notifications/:id` | Delete notification | ✅ |
| GET | `/api/admin/stats` | Platform analytics | 👑 |
| GET | `/api/admin/users` | Manage users (search, paginate) | 👑 |
| PUT | `/api/admin/users/:id/role` | Change role | 👑 |
| DELETE | `/api/admin/users/:id` | Delete user + their data | 👑 |
| GET | `/api/admin/properties` | All listings (verification filter) | 👑 |
| PUT | `/api/admin/properties/:id/verify` | Approve / reject listing | 👑 |
| PUT | `/api/admin/properties/:id/feature` | Toggle featured | 👑 |

### Demo data

```bash
npm run seed --prefix server
# 12 sample listings
# demo@homehaven.com / Demo1234   (agent)
# admin@homehaven.com / Admin1234 (admin — unlocks the admin dashboard)
```

## Features

- 🌗 Dark / light mode with OS-preference detection and no flash on load
- 🔐 JWT auth via httpOnly cookies, bcrypt-hashed passwords
- 🛡️ Protected routes + guest-only routes with auth-check loading states
- 📱 Fully responsive with animated mobile navigation
- ✅ Form validation with React Hook Form + Zod
- 🔔 Themed toast notifications
- 💥 Global error boundary and centralized API error handling
