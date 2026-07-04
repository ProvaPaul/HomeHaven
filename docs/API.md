# HomeHaven API Documentation

Base URL: `http://localhost:5000/api` (development) · `https://<your-render-app>.onrender.com/api` (production)

**Authentication** — JWT delivered as an httpOnly cookie on login/register. Clients may also send
`Authorization: Bearer <token>` (the token is included in login/register responses).
🔒 = requires authentication · 👑 = requires the `admin` role.

All responses follow `{ success: boolean, ...payload }`. Errors return
`{ success: false, message: string }` with an appropriate HTTP status.

---

## Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | — | Body: `{ name, email, password }`. Sets cookie, returns `{ user, token }` |
| POST | `/login` | — | Body: `{ email, password }` |
| POST | `/logout` | — | Clears the auth cookie |
| GET | `/me` | 🔒 | Current user (includes `favorites` ids) |
| PUT | `/profile` | 🔒 | Body: `{ name?, avatar? }` |
| PUT | `/password` | 🔒 | Body: `{ currentPassword, newPassword }` |

## Properties — `/api/properties`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | — | List with filters (below), pagination `{ properties, page, pages, total }` |
| GET | `/featured` | — | Featured listings (`?limit=6`) |
| GET | `/meta` | — | Filter metadata: types, statuses, cities, amenities |
| GET | `/:id` | — | Details (+1 view), owner populated |
| GET | `/:id/similar` | — | Up to 3 similar listings |
| POST | `/` | 🔒 | Create listing (see schema below) |
| PUT | `/:id` | 🔒 | Update — owner or admin only |
| DELETE | `/:id` | 🔒 | Delete — owner or admin only (cascades inquiries) |
| GET | `/user/me` | 🔒 | My listings |
| POST | `/:id/contact` | — | Body: `{ name, email, phone?, message }` → creates inquiry + notifies seller |
| GET | `/inquiries/me` | 🔒 | Inquiries received on my listings |

**List query parameters**

```
q          text search (title, description, city)
type       house | apartment | villa | condo | land | commercial
status     for-sale | for-rent | sold | rented
city       case-insensitive match
minPrice / maxPrice   numbers
beds / baths          minimum counts
minArea / maxArea     sqft
amenities  comma-separated, all must match
ids        comma-separated ObjectIds (used by Compare)
featured   "true"
sort       newest | oldest | price-asc | price-desc | popular
page / limit          pagination (limit ≤ 50)
```

**Property schema (create/update body)**

```json
{
  "title": "Modern Family House",         // 5–120 chars
  "description": "…",                     // 20–5000 chars
  "type": "house",
  "status": "for-sale",
  "price": 749000,
  "bedrooms": 4, "bathrooms": 3,
  "area": 2800,                           // sqft
  "yearBuilt": 2019,                      // optional
  "address": { "street": "", "city": "Austin", "state": "TX", "zipCode": "", "country": "USA" },
  "amenities": ["Garage", "Garden"],
  "images": ["https://…"]                 // 1–12 URLs
}
```

`verification` (`pending | approved | rejected`) and `featured` are admin-controlled.
Rejected listings are hidden from all public queries.

## Favorites — `/api/favorites` (🔒)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | My wishlist (populated properties) |
| POST | `/:propertyId` | Toggle — returns `{ isFavorite, favoriteIds }` |

## Users — `/api/users` (🔒)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard` | Stats + chart series (listings by status, top listings, inquiries by day) |
| GET | `/saved-searches` | List saved searches |
| POST | `/saved-searches` | Body: `{ name, query }` — query is a URL search string |
| DELETE | `/saved-searches/:searchId` | Remove one |

## Notifications — `/api/notifications` (🔒)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Latest 50 + unread count |
| PUT | `/read-all` | Mark all read |
| PUT | `/:id/read` | Mark one read |
| DELETE | `/:id` | Delete one |

Types: `inquiry`, `verification`, `welcome`, `system`.

## Admin — `/api/admin` (👑)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/stats` | Platform totals + chart series (users/month, listings by type/status, top cities, recents) |
| GET | `/users` | Paginated, `?q=&role=&page=&limit=` — includes listing counts |
| PUT | `/users/:id/role` | Body: `{ role: user \| agent \| admin }` |
| DELETE | `/users/:id` | Delete user + their listings/inquiries/notifications |
| GET | `/properties` | Paginated, `?verification=&q=` — includes rejected |
| PUT | `/properties/:id/verify` | Body: `{ action: approved \| rejected \| pending }` — notifies owner |
| PUT | `/properties/:id/feature` | Toggle featured |

## AI — `/api/ai` (rate-limited: 30 req/min/IP)

Every endpoint works without an LLM key via heuristic fallbacks; responses include
`aiGenerated: boolean` where relevant.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/status` | — | `{ aiEnabled, provider }` |
| POST | `/search` | — | Body: `{ query }` → `{ filters, explanation, properties, total }`. Understands prices (k/m/lakh/crore), beds, types, rent/buy, cities |
| POST | `/chat` | — | Body: `{ messages: [{role, content}], propertyId? }` → `{ reply, properties }` |
| POST | `/describe` | 🔒 | Body: property facts → `{ description }` |
| GET | `/summary/:propertyId` | — | `{ summary, highlights }` |
| POST | `/recommendations` | optional | Body: `{ viewedIds?, limit? }` → personalized (or popular) `{ properties, basis, reason }` |
| POST | `/estimate-price` | — | Body: `{ type, city, area, bedrooms?, bathrooms?, status?, yearBuilt? }` → comparable-based `{ estimate, low, high, perSqft, confidence, note }` |
| GET | `/nearby/:propertyId` | — | Schools/healthcare/restaurants/bus stops with distances (OpenStreetMap, cached 24h) |
| GET | `/seller-insights` | 🔒 | `{ stats, mostViewed, trending, bestPostingTime, tips, narrative }` |

## Commute — `/api/commute` (rate-limited: 40 req/min/IP)

Driving is always computed via the free OSRM demo server. Walking/cycling use OpenRouteService
if `ORS_API_KEY` is set, otherwise a distance-based heuristic. All geocoding and route results
are cached in MongoDB for 24h.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/geocode` | Body: `{ query }` → `{ available, location: { lat, lon, label } }` |
| POST | `/estimate` | Body: `{ destination: { lat, lon }, propertyIds: [] }` → `{ commutes: { [propertyId]: { available, drivingMin, walkingMin, cyclingMin, distanceKm, source } } }` — used for list-page badges/filter/sort |
| POST | `/property/:id` | Body: `{ destinations: [{ label, lat, lon }] }` → `{ results: [{ label, available, drivingMin, walkingMin, cyclingMin, distanceKm }] }` — used on the Property Details page |

## Misc

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check (used by Render) |
