import mongoose from 'mongoose';

/**
 * Caches Nominatim geocoding results for 24h so the same address string
 * (a property's address or a user-entered destination) isn't re-geocoded
 * on every commute request.
 */
const geocodeCacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  label: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
});

const GeocodeCache = mongoose.model('GeocodeCache', geocodeCacheSchema);

export default GeocodeCache;
