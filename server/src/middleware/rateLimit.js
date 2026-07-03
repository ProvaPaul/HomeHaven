// Minimal in-memory rate limiter for the AI endpoints (per IP)
const hits = new Map();

export const rateLimit = ({ windowMs = 60000, max = 30 } = {}) => (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (hits.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests — please slow down and try again in a minute.',
    });
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }
  next();
};
