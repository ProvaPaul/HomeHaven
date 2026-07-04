/**
 * Commute-Time Search: geocoding + multi-modal routing between a property
 * and a user-entered destination (workplace, university, etc).
 *
 * Routing strategy (all free, no required key):
 *  - Driving: OSRM's public demo server (router.project-osrm.org). This is
 *    the only profile the public demo compiles, so it's used for driving only.
 *  - Walking/cycling: OpenRouteService, only if ORS_API_KEY is configured.
 *  - Fallback: a distance-based heuristic (avg speed per mode) when a mode
 *    has no routing provider available, or a provider call fails — the same
 *    "always degrade gracefully" pattern the rest of the AI features use.
 *
 * Both geocoding and route results are cached in MongoDB for 24h.
 */

import GeocodeCache from '../models/GeocodeCache.js';
import CommuteCache from '../models/CommuteCache.js';
import { env } from '../config/env.js';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const WALK_SPEED_KMH = 5;
const CYCLE_SPEED_KMH = 15;
const ROAD_FACTOR = 1.3; // straight-line -> approximate road-distance multiplier

/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs]
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in km
 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const round4 = (n) => Math.round(n * 10000) / 10000;

/**
 * Geocode a free-text address via Nominatim, cached in MongoDB for 24h.
 * @param {string} query
 * @returns {Promise<{lat:number, lon:number, label:string}|null>}
 */
export async function geocodeAddress(query) {
  const key = query.trim().toLowerCase();
  if (!key) return null;

  const cached = await GeocodeCache.findOne({ query: key }).lean();
  if (cached) return { lat: cached.lat, lon: cached.lon, label: cached.label };

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url, {
    headers: { 'User-Agent': 'HomeHaven/2.0 (real-estate demo app)' },
  });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const results = await res.json();
  if (!results.length) return null;

  const location = {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    label: results[0].display_name,
  };

  await GeocodeCache.findOneAndUpdate(
    { query: key },
    { query: key, ...location, createdAt: new Date() },
    { upsert: true }
  );

  return location;
}

/**
 * @param {{lat:number, lon:number}} from
 * @param {{lat:number, lon:number}} to
 * @returns {Promise<{minutes:number, km:number}|null>}
 */
async function routeOSRMDriving(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false&alternatives=false`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) throw new Error(`OSRM routing failed (${res.status})`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) return null;
  return { minutes: Math.round(route.duration / 60), km: Math.round((route.distance / 1000) * 10) / 10 };
}

/**
 * @param {{lat:number, lon:number}} from
 * @param {{lat:number, lon:number}} to
 * @param {'foot-walking'|'cycling-regular'} profile
 * @returns {Promise<{minutes:number, km:number}|null>}
 */
async function routeORS(from, to, profile) {
  if (!env.ORS_API_KEY) return null;
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: env.ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coordinates: [[from.lon, from.lat], [to.lon, to.lat]] }),
    },
    10000
  );
  if (!res.ok) throw new Error(`OpenRouteService failed (${res.status})`);
  const data = await res.json();
  const summary = data.routes?.[0]?.summary;
  if (!summary) return null;
  return { minutes: Math.round(summary.duration / 60), km: Math.round((summary.distance / 1000) * 10) / 10 };
}

const heuristicMinutes = (km, speedKmh) => Math.max(1, Math.round((km / speedKmh) * 60));

/**
 * Compute driving/walking/cycling times between two coordinates, cached in
 * MongoDB for 24h. Never throws — falls back to a distance heuristic for any
 * mode whose provider is unavailable or fails.
 * @param {{lat:number, lon:number}} origin
 * @param {{lat:number, lon:number}} destination
 * @returns {Promise<{distanceKm:number, drivingMin:number, walkingMin:number, cyclingMin:number, source:string}>}
 */
export async function getCommute(origin, destination) {
  const key = `${round4(origin.lat)},${round4(origin.lon)}->${round4(destination.lat)},${round4(destination.lon)}`;

  const cached = await CommuteCache.findOne({ key }).lean();
  if (cached) {
    return {
      distanceKm: cached.distanceKm,
      drivingMin: cached.drivingMin,
      walkingMin: cached.walkingMin,
      cyclingMin: cached.cyclingMin,
      source: cached.source,
    };
  }

  const straightLineKm = haversineKm(origin.lat, origin.lon, destination.lat, destination.lon);
  let driving = null;
  try {
    driving = await routeOSRMDriving(origin, destination);
  } catch (error) {
    console.error('OSRM driving route failed, using heuristic:', error.message);
  }

  const roadKm = driving?.km ?? Math.round(straightLineKm * ROAD_FACTOR * 10) / 10;

  let walking = null;
  let cycling = null;
  let usedOrs = false;
  try {
    [walking, cycling] = await Promise.all([
      routeORS(origin, destination, 'foot-walking'),
      routeORS(origin, destination, 'cycling-regular'),
    ]);
    usedOrs = Boolean(walking || cycling);
  } catch (error) {
    console.error('OpenRouteService routing failed, using heuristic:', error.message);
  }

  const result = {
    distanceKm: roadKm,
    drivingMin: driving?.minutes ?? heuristicMinutes(roadKm, 40),
    walkingMin: walking?.minutes ?? heuristicMinutes(roadKm, WALK_SPEED_KMH),
    cyclingMin: cycling?.minutes ?? heuristicMinutes(roadKm, CYCLE_SPEED_KMH),
    source: driving && usedOrs ? 'osrm+ors' : driving ? 'osrm+heuristic' : 'heuristic',
  };

  await CommuteCache.findOneAndUpdate(
    { key },
    { key, ...result, createdAt: new Date() },
    { upsert: true }
  );

  return result;
}

/**
 * Geocode a property's address (cached) and compute its commute to a
 * destination. Never throws — returns `{available:false}` on geocode failure.
 * @param {{street?:string, city:string, state?:string, zipCode?:string, country?:string}} address
 * @param {{lat:number, lon:number}} destination
 */
export async function getCommuteForProperty(address, destination) {
  const parts = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(', ');

  let location = await geocodeAddress(parts);
  if (!location && address.city) {
    location = await geocodeAddress([address.city, address.state, address.country].filter(Boolean).join(', '));
  }
  if (!location) return { available: false, message: 'Could not locate this property on the map' };

  const commute = await getCommute(location, destination);
  return { available: true, ...commute };
}

export const __internals = { haversineKm, heuristicMinutes, CACHE_TTL_MS };
