# Architecture & Folder Structure

## High-level design

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  client/  (React 18 + Vite) │  HTTP  │  server/  (Express + Mongoose)│
│  Redux Toolkit · Tailwind   │ ─────▶ │  JWT (httpOnly cookies)       │
│  React Router (code-split)  │  /api  │  MongoDB                      │
└─────────────────────────────┘        └──────────────────────────────┘
        │ direct uploads                        │ optional
        ▼                                       ▼
  Firebase Storage                    Gemini/OpenAI · OpenStreetMap
```

- **Auth**: JWT in an httpOnly cookie (XSS-safe) with Bearer-header support for API clients.
  Route guards (`ProtectedRoute`, `GuestRoute`, `AdminRoute`) wait for the initial session check.
- **State**: Redux Toolkit slices per domain (`auth`, `properties`, `favorites`, `compare`,
  `notifications`); page-local state stays in components. Compare + recently-viewed persist to localStorage.
- **AI**: provider-agnostic service (Gemini → OpenAI) with heuristic fallbacks so no feature
  hard-depends on a paid API. All AI routes are rate-limited in-memory.
- **Performance**: route-level code splitting (charts ship only to dashboard visitors), vendor
  chunking, lazy images, gzip (compression), immutable asset caching on Vercel.

## Folder structure

```
Homehaven/
├── client/                          # React frontend (Vite)
│   ├── public/                      # favicon, robots.txt
│   ├── vercel.json                  # SPA rewrites + asset caching
│   └── src/
│       ├── app/store.js             # Redux store composition
│       ├── components/
│       │   ├── ai/                  # SmartSearchBar, AiChatWidget, AiSummary,
│       │   │                        # NearbyPlaces, PriceEstimator, Recommendations
│       │   ├── common/              # ErrorBoundary, RouteError, route guards,
│       │   │                        # Pagination, PageLoader, ThemeToggle
│       │   ├── dashboard/           # DashboardLayout, StatCard, ChartCard,
│       │   │                        # DataTable, EmptyState, NotificationsBell
│       │   ├── layout/              # Navbar, Footer, RootLayout, AuthLayout
│       │   ├── property/            # PropertyCard (+skeleton/grid), Gallery,
│       │   │                        # FiltersPanel, PropertyForm, ContactSellerForm,
│       │   │                        # Favorite/Compare/Share buttons, StatusBadge
│       │   └── ui/                  # Button, Input, Select — design primitives
│       ├── features/                # Redux slices + thunks per domain
│       │   ├── auth/  properties/  favorites/  compare/  notifications/
│       ├── hooks/                   # usePageTitle
│       ├── lib/                     # axios instance, firebase, zod schemas,
│       │                            # chartTheme, formatters, imageQuality,
│       │                            # recentlyViewed, uploadImages, cn()
│       ├── pages/                   # route components (lazy-loaded)
│       │   └── dashboard/           # user dashboard pages
│       │       └── admin/           # admin pages
│       ├── providers/               # ThemeProvider (dark mode), ToastProvider
│       └── routes/index.jsx         # router w/ code splitting + guards
│
├── server/                          # Express API
│   └── src/
│       ├── config/                  # env parsing, MongoDB connection
│       ├── controllers/             # auth, property, favorite, user, dashboard,
│       │                            # notification, admin, ai
│       ├── middleware/              # auth (protect/optionalAuth/restrictTo),
│       │                            # errorHandler, notFound, rateLimit
│       ├── models/                  # User, Property, Inquiry, Notification
│       ├── routes/                  # one router per domain, mounted in app.js
│       ├── services/                # aiService (LLM), queryParser (NL search),
│       │                            # nearbyService (OpenStreetMap)
│       ├── seed/seed.js             # demo data (npm run seed)
│       ├── utils/                   # ApiError, asyncHandler, token helpers
│       ├── app.js                   # express app: security, routes, errors
│       └── server.js                # bootstrap: connect DB, listen
│
├── docs/                            # API.md, DEPLOYMENT.md, ARCHITECTURE.md
├── render.yaml                      # Render blueprint for the API
└── package.json                     # root: `npm run dev` runs client + server
```

## Conventions

- **Controllers** are thin: validate → query → respond; shared logic lives in `services/`.
- **Errors** flow through `ApiError` + `asyncHandler` into one `errorHandler` (handles Mongoose
  validation, cast errors, duplicate keys). Clients read a normalized `error.message` via the
  axios interceptor.
- **Ownership**: property mutations check `owner === req.user` (admins bypass). Admin-only fields
  (`featured`, `verification`) are stripped from non-admin payloads.
- **Charts** use validated palettes in `lib/chartTheme.js` — fixed hue per entity, light/dark
  variants; don't inline hex colors in chart code.
- **New domain checklist**: model → controller → route (mount in `app.js`) → slice/thunks (if
  client state is shared) → page/components → lazy route entry.
