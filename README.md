# 🏠 HomeHaven 2.0

**A production-ready, AI-powered real estate platform** built with the MERN stack.
Browse verified listings, chat with an AI assistant, get smart recommendations, manage
properties from rich dashboards — with dark mode, charts, and full deployment configs included.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) ·
[API Docs](docs/API.md) · [Architecture](docs/ARCHITECTURE.md) · [Deployment](docs/DEPLOYMENT.md)

---

## ✨ Features

### Marketplace
- 🔍 **Advanced search** — filters (type, status, city, price, beds, baths), sorting, pagination, all URL-driven and shareable
- 🏷️ **Property listings** — image galleries with lightbox, verified badges, view counts, similar properties
- ❤️ **Wishlist**, ⚖️ **side-by-side compare** (up to 3), 🕘 **recently viewed**, 🔖 **saved searches**
- ✉️ **Contact seller** with an inquiry inbox and in-app notifications
- 📱 Fully responsive with animated mobile navigation

### AI-powered (works with or without an API key)
- 💬 **"Haven" chat assistant** — finds listings from natural conversation, aware of the page you're viewing
- 🗣️ **Smart search** — *"apartments for rent under 4k in Seattle"*, understands k/m/**lakh/crore**
- ✍️ **AI description generator** and 📝 **listing summaries**
- 🎯 **Personalized recommendations** from favorites + browsing history
- 💰 **Price estimator** built on real comparables from the database
- 📷 **Image quality checker** — client-side blur/exposure/resolution detection
- 📍 **What's nearby** — real schools, hospitals, restaurants, bus stops via OpenStreetMap
- 🚗 **Commute-Time Search** — save a workplace/university/any address, see live 🚗 driving, 🚶 walking, 🚴 cycling times on every listing, filter by max commute, sort by shortest — powered by OSRM (free) + OpenRouteService, cached in MongoDB for 24h
- 📈 **Seller insights** — most-viewed listing, best posting time, AI improvement tips

> Add a free `GEMINI_API_KEY` for full LLM quality — every feature has a smart heuristic fallback and works without one.
> Commute-Time Search works out of the box (OSRM handles driving for free); add a free `ORS_API_KEY` from [openrouteservice.org](https://openrouteservice.org/dev/#/signup) for real walking/cycling routing instead of the distance-based estimate.

### Dashboards
- 👤 **User dashboard** — stats, Recharts analytics (inquiries over time, portfolio mix, top listings), listings manager, notifications, profile + password + theme settings
- 👑 **Admin dashboard** — platform analytics, user management (roles, search), listing **verification workflow** (approve/reject/feature), CSV report exports

### Engineering
- 🔐 JWT auth in httpOnly cookies, bcrypt hashing, role-based access, rate limiting, helmet + compression
- ⚡ Route-level code splitting (charts only ship to dashboard visitors), vendor chunking, lazy images
- 🌗 Dark/light theme with OS detection and zero flash-of-wrong-theme
- ♿ Skip links, ARIA labels, keyboard-navigable gallery, reduced-motion support
- 💥 Error boundaries, router error pages, skeleton loaders, empty states everywhere

## 🛠 Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router, React Hook Form + Zod, Framer Motion, Recharts, Lucide, React Hot Toast |
| Backend | Node.js, Express, MongoDB + Mongoose, JWT, Helmet, Compression |
| AI | Gemini / OpenAI (pluggable), OpenStreetMap (Nominatim + Overpass), heuristic fallbacks |
| Storage | Firebase Storage (image uploads) |
| Deploy | Vercel (client) · Render (API) · MongoDB Atlas |

## 🚀 Quick Start

**Prerequisites:** Node 18+, MongoDB running locally (or an Atlas URI)

```bash
# 1. Install
npm install
npm install --prefix client
npm install --prefix server

# 2. Configure
cp server/.env.example server/.env    # defaults work for local dev

# 3. Demo data (12 listings + demo & admin accounts)
npm run seed --prefix server

# 4. Run both apps
npm run dev
```

Open **http://localhost:5173** — API runs on :5000 (proxied at `/api`).

**Demo accounts**

| Role | Email | Password |
| --- | --- | --- |
| Agent (12 listings) | `demo@homehaven.com` | `Demo1234` |
| Admin | `admin@homehaven.com` | `Admin1234` |

## 📚 Documentation

| Doc | Contents |
| --- | --- |
| [docs/API.md](docs/API.md) | Every endpoint, params, schemas, auth requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder structure, design decisions, conventions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Step-by-step Vercel + Render + Atlas + Firebase, env-var reference |

## 📦 Project Structure (short version)

```
client/src/
  components/{ai,common,dashboard,layout,property,ui}
  features/{auth,properties,favorites,compare,notifications}   # Redux slices
  pages/ (+ pages/dashboard, pages/dashboard/admin)            # lazy-loaded routes
  lib/                                                         # axios, firebase, validation, chart theme…
server/src/
  controllers/ · models/ · routes/ · services/ · middleware/ · config/ · seed/
```

Full tree with explanations → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## ☁️ Deployment

One-page summary (details in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)):

1. **MongoDB Atlas** — free M0 cluster, allow `0.0.0.0/0`, copy the connection string
2. **Render** — New → Blueprint → this repo (uses [render.yaml](render.yaml)); set `MONGO_URI` + `CLIENT_URL`
3. **Vercel** — import repo, root dir `client`, set `VITE_API_URL=https://<render-app>.onrender.com/api`
4. **Firebase Storage** *(optional)* — add `VITE_FIREBASE_*` vars to enable direct image uploads

## 📄 License

MIT — free to use for learning and portfolios.
