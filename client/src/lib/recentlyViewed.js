const KEY = 'homehaven-recently-viewed';
const MAX = 8;

export function recordView(property) {
  if (!property?._id) return;
  const snapshot = {
    _id: property._id,
    title: property.title,
    price: property.price,
    status: property.status,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    image: property.images?.[0] || '',
    city: property.address?.city || '',
    viewedAt: Date.now(),
  };
  try {
    const list = getRecentlyViewed().filter((p) => p._id !== property._id);
    list.unshift(snapshot);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Storage full or unavailable — recently viewed is best-effort
  }
}

export function getRecentlyViewed(excludeId) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return excludeId ? list.filter((p) => p._id !== excludeId) : list;
  } catch {
    return [];
  }
}
