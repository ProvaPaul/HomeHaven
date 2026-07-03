/**
 * Nearby amenities via OpenStreetMap (Nominatim geocoding + Overpass API).
 * Free, no API key. Results are cached in memory for 24h per location.
 */

const CACHE = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const RADIUS_M = 3000;

const CATEGORIES = {
  schools: '["amenity"~"^(school|college|university|kindergarten)$"]',
  hospitals: '["amenity"~"^(hospital|clinic|doctors|pharmacy)$"]',
  restaurants: '["amenity"~"^(restaurant|cafe|fast_food)$"]',
  busStops: '["highway"="bus_stop"]',
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'HomeHaven/2.0 (real-estate demo app)' },
  });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const results = await res.json();
  if (!results.length) return null;
  return {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    label: results[0].display_name,
  };
}

async function queryOverpass(lat, lon) {
  const blocks = Object.values(CATEGORIES)
    .map((selector) => `nwr(around:${RADIUS_M},${lat},${lon})${selector};`)
    .join('\n');
  const query = `[out:json][timeout:15];(${blocks});out center 120;`;

  const res = await fetchWithTimeout('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  }, 18000);
  if (!res.ok) throw new Error(`Overpass query failed (${res.status})`);
  const data = await res.json();
  return data.elements || [];
}

const categorize = (tags) => {
  const amenity = tags.amenity || '';
  if (/^(school|college|university|kindergarten)$/.test(amenity)) return 'schools';
  if (/^(hospital|clinic|doctors|pharmacy)$/.test(amenity)) return 'hospitals';
  if (/^(restaurant|cafe|fast_food)$/.test(amenity)) return 'restaurants';
  if (tags.highway === 'bus_stop') return 'busStops';
  return null;
};

export async function getNearbyPlaces(address) {
  const parts = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(', ');
  const cacheKey = parts.toLowerCase();

  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.value;

  // Fall back from full address to city-level geocoding
  let location = await geocode(parts);
  if (!location && address.city) {
    location = await geocode([address.city, address.state, address.country].filter(Boolean).join(', '));
  }
  if (!location) return { available: false, message: 'Could not locate this address on the map' };

  const elements = await queryOverpass(location.lat, location.lon);

  const places = { schools: [], hospitals: [], restaurants: [], busStops: [] };
  const seen = new Set();
  for (const el of elements) {
    const tags = el.tags || {};
    const category = categorize(tags);
    if (!category) continue;
    const name = tags.name || tags['name:en'];
    if (!name) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    const dedupeKey = `${category}:${name.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    places[category].push({
      name,
      distanceKm: Math.round(haversineKm(location.lat, location.lon, lat, lon) * 10) / 10,
    });
  }
  for (const key of Object.keys(places)) {
    places[key] = places[key].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5);
  }

  const value = { available: true, location, places };
  CACHE.set(cacheKey, { at: Date.now(), value });
  return value;
}
