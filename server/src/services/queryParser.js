import Property, { PROPERTY_TYPES } from '../models/Property.js';
import { aiAvailable, generateJson } from './aiService.js';

/**
 * Turn a natural-language property query into structured filters.
 * Uses the LLM when configured; otherwise a rule-based parser that
 * understands prices (k/m/lakh/crore), beds/baths, types, rent/buy, and cities.
 */

const UNIT_MULTIPLIERS = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  mil: 1e6,
  million: 1e6,
  lakh: 1e5,
  lakhs: 1e5,
  lac: 1e5,
  lacs: 1e5,
  crore: 1e7,
  crores: 1e7,
  cr: 1e7,
};

const UNIT_RX = '(k|thousand|m|mil|million|lakh|lakhs|lac|lacs|crore|crores|cr)?';
const NUM_RX = '\\$?\\s*([\\d,]+(?:\\.\\d+)?)';

const parseAmount = (num, unit) => {
  const value = parseFloat(num.replace(/,/g, ''));
  return Math.round(value * (UNIT_MULTIPLIERS[unit?.toLowerCase()] || 1));
};

const TYPE_KEYWORDS = {
  apartment: ['apartment', 'apartments', 'flat', 'flats'],
  house: ['house', 'houses', 'home', 'homes', 'bungalow'],
  villa: ['villa', 'villas'],
  condo: ['condo', 'condos', 'loft', 'lofts'],
  land: ['land', 'plot', 'plots', 'parcel', 'acre', 'acres'],
  commercial: ['commercial', 'office', 'offices', 'shop', 'shops', 'retail'],
};

export async function parseSearchQuery(query) {
  const cities = await Property.distinct('address.city');

  if (aiAvailable()) {
    try {
      const result = await generateJson({
        system:
          'You convert real-estate search queries into JSON filters. ' +
          'Respond with a single JSON object using only these optional keys: ' +
          'type (one of: ' + PROPERTY_TYPES.join(', ') + '), status ("for-sale" or "for-rent"), ' +
          'city (string), minPrice (number), maxPrice (number), beds (min bedrooms, number), ' +
          'baths (min bathrooms, number), q (leftover keywords, string). ' +
          'Convert units: 1 lakh = 100000, 1 crore = 10000000, 500k = 500000, 1m = 1000000. ' +
          `Known cities: ${cities.join(', ')}. Only set city if it clearly matches one. ` +
          'Omit keys you are not confident about.',
        prompt: query,
      });
      const filters = sanitizeFilters(result, cities);
      return { filters, source: 'ai' };
    } catch (error) {
      console.error('AI parse failed, using heuristic parser:', error.message);
    }
  }

  return { filters: heuristicParse(query, cities), source: 'heuristic' };
}

const sanitizeFilters = (raw, cities) => {
  const filters = {};
  if (PROPERTY_TYPES.includes(raw.type)) filters.type = raw.type;
  if (['for-sale', 'for-rent'].includes(raw.status)) filters.status = raw.status;
  if (raw.city && cities.some((c) => c.toLowerCase() === String(raw.city).toLowerCase())) {
    filters.city = raw.city;
  }
  if (Number(raw.minPrice) > 0) filters.minPrice = Number(raw.minPrice);
  if (Number(raw.maxPrice) > 0) filters.maxPrice = Number(raw.maxPrice);
  if (Number(raw.beds) > 0) filters.beds = Number(raw.beds);
  if (Number(raw.baths) > 0) filters.baths = Number(raw.baths);
  if (raw.q && typeof raw.q === 'string' && raw.q.trim()) filters.q = raw.q.trim().slice(0, 80);
  return filters;
};

export function heuristicParse(query, cities = []) {
  const text = query.toLowerCase();
  const filters = {};

  // Price: between / under / over
  const between = text.match(new RegExp(`between\\s*${NUM_RX}\\s*${UNIT_RX}\\s*(?:and|-|to)\\s*${NUM_RX}\\s*${UNIT_RX}`, 'i'));
  if (between) {
    filters.minPrice = parseAmount(between[1], between[2]);
    filters.maxPrice = parseAmount(between[3], between[4]);
  } else {
    const under = text.match(new RegExp(`(?:under|below|less than|max(?:imum)?|up to|within|budget(?: of)?)\\s*${NUM_RX}\\s*${UNIT_RX}`, 'i'));
    if (under) filters.maxPrice = parseAmount(under[1], under[2]);
    const over = text.match(new RegExp(`(?:over|above|more than|min(?:imum)?|at least|starting(?: at| from)?)\\s*${NUM_RX}\\s*${UNIT_RX}`, 'i'));
    if (over) filters.minPrice = parseAmount(over[1], over[2]);
  }

  // Beds / baths ("3 bed", "3bhk")
  const beds = text.match(/(\d+)\s*\+?\s*(?:bhk|bed(?:room)?s?)/);
  if (beds) filters.beds = Number(beds[1]);
  const baths = text.match(/(\d+)\s*\+?\s*bath(?:room)?s?/);
  if (baths) filters.baths = Number(baths[1]);

  // Type
  for (const [type, words] of Object.entries(TYPE_KEYWORDS)) {
    if (words.some((w) => new RegExp(`\\b${w}\\b`).test(text))) {
      filters.type = type;
      break;
    }
  }

  // Status
  if (/\brent(al|ing|ed)?\b|\bto let\b|\blease\b/.test(text)) filters.status = 'for-rent';
  else if (/\bbuy(ing)?\b|\bsale\b|\bpurchase\b/.test(text)) filters.status = 'for-sale';

  // City (match against known cities)
  const city = cities.find((c) => new RegExp(`\\b${c.toLowerCase()}\\b`).test(text));
  if (city) filters.city = city;

  // If nothing matched, fall back to a text search
  if (Object.keys(filters).length === 0) filters.q = query.slice(0, 80);

  return filters;
}

export const describeFilters = (filters) => {
  const parts = [];
  if (filters.beds) parts.push(`${filters.beds}+ bedrooms`);
  if (filters.type) parts.push(filters.type + 's');
  if (filters.status) parts.push(filters.status === 'for-rent' ? 'for rent' : 'for sale');
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.minPrice && filters.maxPrice) {
    parts.push(`$${filters.minPrice.toLocaleString()}–$${filters.maxPrice.toLocaleString()}`);
  } else if (filters.maxPrice) parts.push(`under $${filters.maxPrice.toLocaleString()}`);
  else if (filters.minPrice) parts.push(`over $${filters.minPrice.toLocaleString()}`);
  if (filters.q) parts.push(`matching "${filters.q}"`);
  return parts.length ? parts.join(', ') : 'all properties';
};
