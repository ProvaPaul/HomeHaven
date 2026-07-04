import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { geocodeAddress, getCommuteForProperty } from '../services/commuteService.js';

const MAX_BATCH_PROPERTIES = 100;
const MAX_DESTINATIONS = 5;

// @route POST /api/commute/geocode { query }
export const geocodeDestination = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) throw new ApiError(400, 'An address is required');

  let location = null;
  try {
    location = await geocodeAddress(query.trim().slice(0, 200));
  } catch (error) {
    console.error('Geocode lookup failed:', error.message);
    return res.json({
      success: true,
      available: false,
      message: 'The map service is temporarily unavailable. Please try again shortly.',
    });
  }

  if (!location) {
    return res.json({
      success: true,
      available: false,
      message: "Couldn't find that address — try adding a city or being more specific.",
    });
  }

  res.json({ success: true, available: true, location });
});

// @route POST /api/commute/estimate { destination:{lat,lon,label}, propertyIds:[] }
// Commute for many properties to a single destination — powers the list page badges/filter/sort.
export const estimateCommutes = asyncHandler(async (req, res) => {
  const { destination, propertyIds } = req.body;
  if (!destination || typeof destination.lat !== 'number' || typeof destination.lon !== 'number') {
    throw new ApiError(400, 'A valid destination with lat/lon is required');
  }

  const ids = Array.isArray(propertyIds)
    ? propertyIds.filter((id) => mongoose.isValidObjectId(id)).slice(0, MAX_BATCH_PROPERTIES)
    : [];
  if (!ids.length) return res.json({ success: true, commutes: {} });

  const properties = await Property.find({ _id: { $in: ids } }).select('address').lean();

  const settled = await Promise.allSettled(
    properties.map(async (p) => ({
      id: String(p._id),
      result: await getCommuteForProperty(p.address, destination),
    }))
  );

  const commutes = {};
  for (const entry of settled) {
    if (entry.status === 'fulfilled') {
      commutes[entry.value.id] = entry.value.result;
    } else {
      console.error('Commute estimate failed for a property:', entry.reason?.message);
    }
  }

  res.json({ success: true, commutes });
});

// @route POST /api/commute/property/:id { destinations:[{label,lat,lon}] }
// Commute for one property to multiple destinations — powers the details page.
export const estimatePropertyCommutes = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid property id');

  const property = await Property.findById(req.params.id).select('address').lean();
  if (!property) throw new ApiError(404, 'Property not found');

  const destinations = Array.isArray(req.body.destinations) ? req.body.destinations.slice(0, MAX_DESTINATIONS) : [];
  const valid = destinations.filter((d) => d && typeof d.lat === 'number' && typeof d.lon === 'number');
  if (!valid.length) throw new ApiError(400, 'At least one valid destination is required');

  const settled = await Promise.allSettled(
    valid.map(async (d) => ({ label: d.label || 'Destination', result: await getCommuteForProperty(property.address, d) }))
  );

  const results = settled.map((entry, i) =>
    entry.status === 'fulfilled'
      ? { label: entry.value.label, ...entry.value.result }
      : { label: valid[i].label || 'Destination', available: false, message: 'Could not compute commute' }
  );

  res.json({ success: true, results });
});
