import mongoose from 'mongoose';

/**
 * Caches computed driving/walking/cycling times between a coordinate pair
 * for 24h so the same property-destination pair isn't re-routed on every
 * search/filter/sort or repeat visit to a listing.
 */
const commuteCacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  distanceKm: { type: Number, default: null },
  drivingMin: { type: Number, default: null },
  walkingMin: { type: Number, default: null },
  cyclingMin: { type: Number, default: null },
  source: {
    type: String,
    enum: ['osrm+ors', 'osrm+heuristic', 'heuristic'],
    default: 'heuristic',
  },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
});

const CommuteCache = mongoose.model('CommuteCache', commuteCacheSchema);

export default CommuteCache;
