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

## Features

- 🌗 Dark / light mode with OS-preference detection and no flash on load
- 🔐 JWT auth via httpOnly cookies, bcrypt-hashed passwords
- 🛡️ Protected routes + guest-only routes with auth-check loading states
- 📱 Fully responsive with animated mobile navigation
- ✅ Form validation with React Hook Form + Zod
- 🔔 Themed toast notifications
- 💥 Global error boundary and centralized API error handling
