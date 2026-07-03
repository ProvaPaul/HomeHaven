# Deployment Guide

HomeHaven deploys as: **frontend → Vercel**, **API → Render**, **database → MongoDB Atlas**,
**images → Firebase Storage**. Total cost on free tiers: $0.

```
Browser ──HTTPS──▶ Vercel (React SPA)
                      │  VITE_API_URL
                      ▼
                   Render (Express API) ──▶ MongoDB Atlas
                      │
                      └──▶ Gemini / OpenAI (optional), OpenStreetMap
Browser ──uploads──▶ Firebase Storage (image URLs stored in Mongo)
```

---

## 1. MongoDB Atlas (database)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) → **Build a Database** → M0 (free).
2. **Database Access** → add a database user (username + strong password).
3. **Network Access** → *Allow access from anywhere* (`0.0.0.0/0`) — required for Render's dynamic IPs.
4. **Connect → Drivers** → copy the connection string and add the db name:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/homehaven?retryWrites=true&w=majority
   ```
5. Seed demo data (optional) — from your machine with `MONGO_URI` pointed at Atlas:
   ```bash
   cd server && MONGO_URI="mongodb+srv://…" npm run seed
   ```
   Creates `demo@homehaven.com / Demo1234` (agent) and `admin@homehaven.com / Admin1234` (admin).

## 2. Render (backend API)

**Option A — Blueprint (recommended):** push the repo to GitHub, then Render Dashboard →
**New → Blueprint** → select the repo. Render reads [render.yaml](../render.yaml) and provisions
`homehaven-api` automatically. Fill in the two `sync: false` variables when prompted.

**Option B — manual:** New → Web Service → repo → Root Directory `server`,
Build `npm install`, Start `npm start`, Health check path `/api/health`.

**Environment variables (Render → Environment):**

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | long random string (Blueprint generates one) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | your Vercel URL, e.g. `https://homehaven.vercel.app` (comma-separate multiple origins) |
| `GEMINI_API_KEY` | *(optional)* enables full AI — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

Note your API URL, e.g. `https://homehaven-api.onrender.com`.

> Free-tier Render sleeps after 15 min idle — the first request after sleep takes ~30s.

## 3. Vercel (frontend)

1. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
2. **Root Directory:** `client` (Framework preset: Vite — auto-detected).
3. **Environment variables:**

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://homehaven-api.onrender.com/api` ← your Render URL + `/api` |
| `VITE_FIREBASE_*` | *(optional)* Firebase keys for image uploads (see §4) |

4. Deploy. [client/vercel.json](../client/vercel.json) already handles SPA routing and asset caching.
5. Go back to Render and set `CLIENT_URL` to your final Vercel URL (exact origin, no trailing slash) — this is what makes cross-site auth cookies work (`SameSite=None; Secure` is automatic in production).

## 4. Firebase Storage (image uploads — optional)

Without Firebase, sellers can still add images by URL. To enable direct uploads:

1. [console.firebase.google.com](https://console.firebase.google.com) → create project → **Storage → Get started**.
2. Rules — allow public read, authenticated-app writes (tighten as needed):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /properties/{file} {
         allow read;
         allow write: if request.resource.size < 5 * 1024 * 1024
                      && request.resource.contentType.matches('image/.*');
       }
     }
   }
   ```
3. Project settings → **Your apps → Web app** → copy the config values into Vercel env vars:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
   `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
4. Redeploy the frontend. The listing form switches from URL-input-only to drag-and-drop uploads automatically.

## 5. Post-deploy checklist

- [ ] `GET https://<api>/api/health` returns `{ success: true }`
- [ ] Register a new account on the live site (cookie auth works = CORS/CLIENT_URL correct)
- [ ] Browse properties, open details, contact a seller
- [ ] Log in as `admin@homehaven.com` → `/dashboard/admin` loads charts
- [ ] `POST /api/ai/status` shows your provider if you set an AI key

## Environment variable reference

**server/.env** — see [server/.env.example](../server/.env.example)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no (5000) | API port (Render sets this automatically) |
| `NODE_ENV` | prod: yes | `development` / `production` |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | prod: yes | Token signing secret |
| `JWT_EXPIRES_IN` | no (7d) | Token lifetime |
| `CLIENT_URL` | prod: yes | Allowed CORS origin(s), comma-separated |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | no | Enables full AI (heuristic fallbacks otherwise) |
| `GEMINI_MODEL` / `OPENAI_MODEL` | no | Override default models |

**client/.env** — see [client/.env.example](../client/.env.example)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | prod: yes | Full API base, e.g. `https://…/api` (dev uses the Vite proxy) |
| `VITE_FIREBASE_*` | no | Firebase Storage config for direct image uploads |
