import mongoose from 'mongoose';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';
import { buildListFilter } from './propertyController.js';
import { aiAvailable, aiProvider, generate, chat as aiChat } from '../services/aiService.js';
import { parseSearchQuery, describeFilters } from '../services/queryParser.js';
import { getNearbyPlaces } from '../services/nearbyService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const publicFields = 'title price status type bedrooms bathrooms area images address featured verification views createdAt';

// @route GET /api/ai/status
export const getAiStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, aiEnabled: aiAvailable(), provider: aiProvider() });
});

// ── 1 & 7. Smart natural-language search ────────────────────────────────────
// @route POST /api/ai/search { query }
export const smartSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) throw new ApiError(400, 'A search query is required');

  const { filters, source } = await parseSearchQuery(query.trim().slice(0, 300));
  const mongoFilter = buildListFilter(filters);
  const [properties, total] = await Promise.all([
    Property.find(mongoFilter).sort({ createdAt: -1 }).limit(9).select(publicFields).lean(),
    Property.countDocuments(mongoFilter),
  ]);

  res.json({
    success: true,
    filters,
    explanation: `Showing ${describeFilters(filters)}`,
    source,
    properties,
    total,
  });
});

// ── 6. AI chat support ───────────────────────────────────────────────────────
// @route POST /api/ai/chat { messages: [{role, content}], propertyId? }
export const chatSupport = asyncHandler(async (req, res) => {
  const { messages, propertyId } = req.body;
  if (!Array.isArray(messages) || !messages.length) {
    throw new ApiError(400, 'messages array is required');
  }
  const history = messages
    .filter((m) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  if (!lastUser) throw new ApiError(400, 'No user message found');

  // Context: a specific listing, or search results for the question
  let contextProperty = null;
  if (propertyId && mongoose.isValidObjectId(propertyId)) {
    contextProperty = await Property.findById(propertyId).select('-__v').lean();
  }
  const { filters } = await parseSearchQuery(lastUser.content);
  const matches = await Property.find(buildListFilter(filters))
    .sort({ createdAt: -1 })
    .limit(5)
    .select(publicFields)
    .lean();

  if (!aiAvailable()) {
    // Heuristic concierge: search + templated reply
    let reply;
    if (contextProperty) {
      reply =
        `"${contextProperty.title}" is a ${contextProperty.bedrooms}-bed, ${contextProperty.bathrooms}-bath ` +
        `${contextProperty.type} (${contextProperty.area.toLocaleString()} sqft) in ${contextProperty.address.city}, ` +
        `listed at $${contextProperty.price.toLocaleString()}${contextProperty.status === 'for-rent' ? '/mo' : ''}. ` +
        `Amenities: ${contextProperty.amenities?.join(', ') || 'not listed'}. ` +
        `Use the contact form on the listing page to reach the seller directly.`;
    } else if (matches.length) {
      reply =
        `I found ${matches.length} propert${matches.length === 1 ? 'y' : 'ies'} for ${describeFilters(filters)}. ` +
        `Here are the top matches — tap one to see full details, photos, and the seller's contact form.`;
    } else {
      reply =
        `I couldn't find listings for ${describeFilters(filters)}. ` +
        `Try widening the budget or removing a filter — or browse all properties from the Properties page.`;
    }
    return res.json({ success: true, reply, properties: matches, aiGenerated: false });
  }

  const system =
    'You are Haven, the friendly AI assistant for HomeHaven, a real-estate marketplace. ' +
    'Help users find properties, understand listings, and use the platform (favorites, compare, saved searches, contacting sellers). ' +
    'Be concise (under 120 words), warm, and concrete. Never invent listings — only reference the provided data. ' +
    'Prices are in USD. If nothing matches, suggest loosening filters.' +
    (contextProperty ? `\n\nThe user is viewing this listing:\n${JSON.stringify(contextProperty)}` : '') +
    (matches.length
      ? `\n\nRelevant listings for their latest message:\n${JSON.stringify(
          matches.map((p) => ({
            title: p.title,
            price: p.price,
            status: p.status,
            type: p.type,
            beds: p.bedrooms,
            baths: p.bathrooms,
            area: p.area,
            city: p.address?.city,
          }))
        )}`
      : '\n\nNo listings matched their latest message.');

  const reply = await aiChat({ system, messages: history, temperature: 0.6, maxTokens: 400 });
  res.json({ success: true, reply: reply.trim(), properties: matches, aiGenerated: true });
});

// ── 2. Description generator ────────────────────────────────────────────────
// @route POST /api/ai/describe
export const generateDescription = asyncHandler(async (req, res) => {
  const { title, type, status, price, bedrooms, bathrooms, area, city, state, amenities, yearBuilt } = req.body;
  if (!type || !city || !area) {
    throw new ApiError(400, 'type, city and area are required to generate a description');
  }

  const facts = {
    title,
    type,
    status,
    price,
    bedrooms,
    bathrooms,
    area: `${area} sqft`,
    location: [city, state].filter(Boolean).join(', '),
    amenities: (amenities || []).slice(0, 15),
    yearBuilt,
  };

  if (aiAvailable()) {
    try {
      const text = await generate({
        system:
          'You are a professional real-estate copywriter. Write a compelling, honest listing description ' +
          'in 2 short paragraphs (120-170 words total). No headings, no bullet points, no invented details — ' +
          'use only the provided facts. Warm, professional tone.',
        prompt: JSON.stringify(facts),
        temperature: 0.8,
        maxTokens: 400,
      });
      return res.json({ success: true, description: text.trim(), aiGenerated: true });
    } catch (error) {
      console.error('AI describe failed, using template:', error.message);
    }
  }

  // Template fallback
  const bedsPhrase = bedrooms > 0 ? `${bedrooms}-bedroom, ${bathrooms || 1}-bathroom ` : '';
  const amenityPhrase = amenities?.length
    ? ` Highlights include ${amenities.slice(0, 5).join(', ').toLowerCase()}.`
    : '';
  const yearPhrase = yearBuilt ? ` Built in ${yearBuilt}, the property has been well maintained.` : '';
  const actionPhrase =
    status === 'for-rent'
      ? 'Available now — schedule a viewing today.'
      : 'Priced to move — arrange your private tour today.';
  const description =
    `Welcome to this inviting ${bedsPhrase}${type} in ${city}${state ? `, ${state}` : ''}, ` +
    `offering ${Number(area).toLocaleString()} sqft of comfortable living space.${yearPhrase}${amenityPhrase} ` +
    `The location puts daily conveniences, dining, and transport links within easy reach. ${actionPhrase}`;
  res.json({ success: true, description, aiGenerated: false });
});

// ── 3. Summary ───────────────────────────────────────────────────────────────
// @route GET /api/ai/summary/:propertyId
export const summarizeProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId).lean();
  if (!property) throw new ApiError(404, 'Property not found');

  const highlights = [
    property.bedrooms > 0 && `${property.bedrooms} bed · ${property.bathrooms} bath`,
    `${property.area.toLocaleString()} sqft`,
    property.address.city,
    ...(property.amenities || []).slice(0, 3),
  ].filter(Boolean);

  if (aiAvailable()) {
    try {
      const text = await generate({
        system:
          'Summarize this property listing in 2 sentences (max 45 words) for a buyer skimming results. ' +
          'Factual, specific, no hype words like "stunning". Plain text only.',
        prompt: JSON.stringify({
          title: property.title,
          description: property.description,
          type: property.type,
          status: property.status,
          price: property.price,
          beds: property.bedrooms,
          baths: property.bathrooms,
          area: property.area,
          city: property.address.city,
          amenities: property.amenities,
        }),
        temperature: 0.4,
        maxTokens: 150,
      });
      return res.json({ success: true, summary: text.trim(), highlights, aiGenerated: true });
    } catch (error) {
      console.error('AI summary failed, using extract:', error.message);
    }
  }

  // Extractive fallback: lead sentences + fact line
  const sentences = property.description.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]/g) || [property.description];
  const lead = sentences.slice(0, 2).join(' ').trim();
  const factLine = `${property.bedrooms > 0 ? `${property.bedrooms}-bed ` : ''}${property.type} · ${property.area.toLocaleString()} sqft · ${property.address.city} · $${property.price.toLocaleString()}${property.status === 'for-rent' ? '/mo' : ''}.`;
  res.json({ success: true, summary: `${lead} ${factLine}`.slice(0, 400), highlights, aiGenerated: false });
});

// ── 4. Smart recommendations ─────────────────────────────────────────────────
// @route POST /api/ai/recommendations { viewedIds?: [], limit? }
export const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.body.limit) || 6);
  const viewedIds = (req.body.viewedIds || [])
    .filter((id) => mongoose.isValidObjectId(id))
    .slice(0, 20);

  let favoriteIds = [];
  if (req.user) {
    const me = await User.findById(req.user._id).select('favorites');
    favoriteIds = me.favorites.map(String);
  }

  const historyIds = [...new Set([...favoriteIds, ...viewedIds.map(String)])];
  const history = historyIds.length
    ? await Property.find({ _id: { $in: historyIds } }).select('type address.city price status').lean()
    : [];

  if (!history.length) {
    // Cold start: popular + featured
    const properties = await Property.find({ verification: { $ne: 'rejected' } })
      .sort({ featured: -1, views: -1 })
      .limit(limit)
      .select(publicFields)
      .lean();
    return res.json({ success: true, properties, basis: 'popular', reason: 'Popular on HomeHaven right now' });
  }

  // Build a preference profile (favorites count double)
  const weightOf = (p) => (favoriteIds.includes(String(p._id)) ? 2 : 1);
  const typeWeights = {};
  const cityWeights = {};
  const statusWeights = {};
  let priceSum = 0;
  let weightSum = 0;
  for (const p of history) {
    const w = weightOf(p);
    typeWeights[p.type] = (typeWeights[p.type] || 0) + w;
    if (p.address?.city) cityWeights[p.address.city] = (cityWeights[p.address.city] || 0) + w;
    statusWeights[p.status] = (statusWeights[p.status] || 0) + w;
    priceSum += p.price * w;
    weightSum += w;
  }
  const avgPrice = priceSum / weightSum;

  const candidates = await Property.find({
    _id: { $nin: historyIds },
    verification: { $ne: 'rejected' },
    ...(req.user && { owner: { $ne: req.user._id } }),
  })
    .select(`${publicFields} amenities`)
    .lean();

  const maxType = Math.max(...Object.values(typeWeights));
  const maxCity = Math.max(1, ...Object.values(cityWeights));
  const scored = candidates
    .map((p) => {
      let score = 0;
      score += ((typeWeights[p.type] || 0) / maxType) * 3;
      score += ((cityWeights[p.address?.city] || 0) / maxCity) * 2.5;
      // Price affinity: full credit within ±35% of the user's average
      const ratio = p.price / avgPrice;
      if (ratio >= 0.65 && ratio <= 1.35) score += 2;
      else if (ratio >= 0.4 && ratio <= 1.8) score += 0.8;
      score += (statusWeights[p.status] || 0) / weightSum;
      if (p.featured) score += 0.4;
      if (p.verification === 'approved') score += 0.3;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const topType = Object.entries(typeWeights).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCity = Object.entries(cityWeights).sort((a, b) => b[1] - a[1])[0]?.[0];

  res.json({
    success: true,
    properties: scored.map((s) => s.p),
    basis: 'profile',
    reason: `Because you like ${topType ? `${topType}s` : 'properties'}${topCity ? ` in ${topCity}` : ''} and similar price ranges`,
  });
});

// ── 5. Price estimator ───────────────────────────────────────────────────────
// @route POST /api/ai/estimate-price
export const estimatePrice = asyncHandler(async (req, res) => {
  const { type, city, area, bedrooms = 0, bathrooms = 0, status = 'for-sale', yearBuilt, amenities = [] } = req.body;
  if (!type || !area) throw new ApiError(400, 'type and area are required');
  const areaNum = Number(area);
  if (!(areaNum > 0)) throw new ApiError(400, 'area must be positive');

  // Comparables: same status, prefer same type+city, widen as needed
  const tiers = [
    { type, 'address.city': new RegExp(`^${String(city || '').trim()}$`, 'i'), status },
    { type, status },
    { status },
  ];
  let comps = [];
  let scope = 'market';
  for (const [i, tier] of tiers.entries()) {
    comps = await Property.find(tier).select('price area type address.city').lean();
    if (comps.length >= 3) {
      scope = i === 0 ? 'city' : i === 1 ? 'type' : 'market';
      break;
    }
  }
  if (!comps.length) {
    return res.json({
      success: true,
      available: false,
      message: 'Not enough market data to estimate yet',
    });
  }

  const perSqftValues = comps.map((c) => c.price / Math.max(1, c.area)).sort((a, b) => a - b);
  const median = perSqftValues[Math.floor(perSqftValues.length / 2)];

  // Adjustments on top of the comparable median
  let multiplier = 1;
  if (bedrooms >= 4) multiplier += 0.05;
  if (bathrooms >= 3) multiplier += 0.03;
  if (yearBuilt && yearBuilt >= new Date().getFullYear() - 5) multiplier += 0.06;
  else if (yearBuilt && yearBuilt < 1980) multiplier -= 0.05;
  multiplier += Math.min(0.06, (amenities?.length || 0) * 0.01);

  const estimate = Math.round((median * areaNum * multiplier) / 100) * 100;
  const spread = comps.length >= 6 ? 0.12 : 0.2;

  res.json({
    success: true,
    available: true,
    estimate,
    low: Math.round((estimate * (1 - spread)) / 100) * 100,
    high: Math.round((estimate * (1 + spread)) / 100) * 100,
    perSqft: Math.round(median * multiplier),
    comparables: comps.length,
    scope,
    confidence: comps.length >= 8 ? 'high' : comps.length >= 4 ? 'medium' : 'low',
    note:
      scope === 'city'
        ? `Based on ${comps.length} comparable ${type} listings in ${city}`
        : scope === 'type'
          ? `Based on ${comps.length} ${type} listings across all cities`
          : `Based on ${comps.length} listings market-wide — add more local data for accuracy`,
  });
});

// ── 9. Nearby places ─────────────────────────────────────────────────────────
// @route GET /api/ai/nearby/:propertyId
export const nearbyPlaces = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId).select('address').lean();
  if (!property) throw new ApiError(404, 'Property not found');

  try {
    const result = await getNearbyPlaces(property.address);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Nearby lookup failed:', error.message);
    res.json({
      success: true,
      available: false,
      message: 'Nearby places service is temporarily unavailable',
    });
  }
});

// ── 10. Seller analytics / insights ─────────────────────────────────────────
// @route GET /api/ai/seller-insights
export const sellerInsights = asyncHandler(async (req, res) => {
  const [listings, inquiries] = await Promise.all([
    Property.find({ owner: req.user._id }).lean(),
    Inquiry.find({ seller: req.user._id }).select('createdAt property').lean(),
  ]);

  if (!listings.length) {
    return res.json({
      success: true,
      hasListings: false,
      message: 'List your first property to unlock AI insights.',
    });
  }

  // Most viewed + best performer per day listed
  const mostViewed = [...listings].sort((a, b) => b.views - a.views)[0];
  const now = Date.now();
  const withRates = listings.map((l) => ({
    ...l,
    viewsPerDay: l.views / Math.max(1, (now - new Date(l.createdAt)) / 86400000),
  }));
  const trending = [...withRates].sort((a, b) => b.viewsPerDay - a.viewsPerDay)[0];

  // Best posting time from inquiry timestamps
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestPostingTime = null;
  if (inquiries.length >= 3) {
    const dayCounts = {};
    const hourBuckets = { 'morning (6am–12pm)': 0, 'afternoon (12–5pm)': 0, 'evening (5–10pm)': 0, 'night (10pm–6am)': 0 };
    for (const inq of inquiries) {
      const d = new Date(inq.createdAt);
      dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + 1;
      const h = d.getHours();
      if (h >= 6 && h < 12) hourBuckets['morning (6am–12pm)']++;
      else if (h >= 12 && h < 17) hourBuckets['afternoon (12–5pm)']++;
      else if (h >= 17 && h < 22) hourBuckets['evening (5–10pm)']++;
      else hourBuckets['night (10pm–6am)']++;
    }
    const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    const topBucket = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];
    bestPostingTime = {
      day: DAYS[topDay[0]],
      window: topBucket[0],
      note: `Most of your inquiries arrive on ${DAYS[topDay[0]]}s in the ${topBucket[0].split(' ')[0]} — new listings posted just before that window get seen first.`,
    };
  }

  // Per-listing improvement tips
  const cityMedians = {};
  const tips = [];
  for (const l of listings) {
    const issues = [];
    if ((l.images?.length || 0) < 3) issues.push('add more photos (aim for 5+)');
    if ((l.description?.length || 0) < 200) issues.push('expand the description with neighborhood details');
    if ((l.amenities?.length || 0) < 3) issues.push('list more amenities');
    if (l.verification === 'pending') issues.push('awaiting verification — verified listings earn a trust badge');

    const key = `${l.type}:${l.address?.city}:${l.status}`;
    if (!(key in cityMedians)) {
      const peers = await Property.find({
        type: l.type,
        'address.city': l.address?.city,
        status: l.status,
        _id: { $ne: l._id },
      })
        .select('price area')
        .lean();
      const values = peers.map((p) => p.price / Math.max(1, p.area)).sort((a, b) => a - b);
      cityMedians[key] = values.length >= 2 ? values[Math.floor(values.length / 2)] : null;
    }
    const median = cityMedians[key];
    if (median) {
      const myRate = l.price / Math.max(1, l.area);
      if (myRate > median * 1.25) issues.push(`priced ~${Math.round((myRate / median - 1) * 100)}% above similar local listings — consider adjusting`);
      else if (myRate < median * 0.75) issues.push('priced well below market — you may be leaving money on the table');
    }
    if (issues.length) tips.push({ propertyId: l._id, title: l.title, issues });
  }

  const stats = {
    totalViews: listings.reduce((s, l) => s + l.views, 0),
    totalInquiries: inquiries.length,
    avgViewsPerListing: Math.round(listings.reduce((s, l) => s + l.views, 0) / listings.length),
  };

  let narrative = null;
  if (aiAvailable()) {
    try {
      narrative = (
        await generate({
          system:
            'You are a real-estate listing coach. Given a seller\'s portfolio stats, write 2-3 sentences of ' +
            'encouraging, specific advice. Plain text, no lists, under 70 words.',
          prompt: JSON.stringify({
            listings: listings.length,
            ...stats,
            mostViewed: { title: mostViewed.title, views: mostViewed.views },
            openIssues: tips.flatMap((t) => t.issues).slice(0, 6),
          }),
          temperature: 0.6,
          maxTokens: 200,
        })
      ).trim();
    } catch (error) {
      console.error('AI narrative failed:', error.message);
    }
  }

  res.json({
    success: true,
    hasListings: true,
    stats,
    mostViewed: { propertyId: mostViewed._id, title: mostViewed.title, views: mostViewed.views },
    trending:
      trending && trending._id.toString() !== mostViewed._id.toString()
        ? {
            propertyId: trending._id,
            title: trending.title,
            viewsPerDay: Math.round(trending.viewsPerDay * 10) / 10,
          }
        : null,
    bestPostingTime,
    tips: tips.slice(0, 6),
    narrative,
    aiGenerated: Boolean(narrative),
  });
});
