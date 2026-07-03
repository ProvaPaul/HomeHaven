import mongoose from 'mongoose';
import Property, { PROPERTY_TYPES, PROPERTY_STATUSES } from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import { notify } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  popular: { views: -1 },
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildListFilter = (query) => {
  const filter = {};

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { 'address.city': rx }];
  }
  if (query.type && PROPERTY_TYPES.includes(query.type)) filter.type = query.type;
  if (query.status && PROPERTY_STATUSES.includes(query.status)) filter.status = query.status;
  if (query.city) filter['address.city'] = new RegExp(escapeRegex(query.city.trim()), 'i');
  if (query.featured === 'true') filter.featured = true;

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (minPrice > 0 || maxPrice > 0) {
    filter.price = {};
    if (minPrice > 0) filter.price.$gte = minPrice;
    if (maxPrice > 0) filter.price.$lte = maxPrice;
  }

  const beds = Number(query.beds);
  if (beds > 0) filter.bedrooms = { $gte: beds };

  const baths = Number(query.baths);
  if (baths > 0) filter.bathrooms = { $gte: baths };

  const minArea = Number(query.minArea);
  const maxArea = Number(query.maxArea);
  if (minArea > 0 || maxArea > 0) {
    filter.area = {};
    if (minArea > 0) filter.area.$gte = minArea;
    if (maxArea > 0) filter.area.$lte = maxArea;
  }

  if (query.amenities) {
    const list = String(query.amenities)
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (list.length) filter.amenities = { $all: list };
  }

  if (query.ids) {
    const ids = String(query.ids)
      .split(',')
      .filter((id) => mongoose.isValidObjectId(id));
    filter._id = { $in: ids };
  }

  // Rejected listings never appear in public results
  filter.verification = { $ne: 'rejected' };

  return filter;
};

// @route GET /api/properties
export const getProperties = asyncHandler(async (req, res) => {
  const filter = buildListFilter(req.query);
  const sort = SORT_OPTIONS[req.query.sort] || SORT_OPTIONS.newest;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'name avatar')
      .lean(),
    Property.countDocuments(filter),
  ]);

  res.json({
    success: true,
    properties,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

// @route GET /api/properties/featured
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Number(req.query.limit) || 6);
  const properties = await Property.find({ featured: true, status: { $in: ['for-sale', 'for-rent'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('owner', 'name avatar')
    .lean();

  res.json({ success: true, properties });
});

// @route GET /api/properties/meta — filter metadata for the client
export const getPropertyMeta = asyncHandler(async (req, res) => {
  const [cities, amenities] = await Promise.all([
    Property.distinct('address.city'),
    Property.distinct('amenities'),
  ]);

  res.json({
    success: true,
    types: PROPERTY_TYPES,
    statuses: PROPERTY_STATUSES,
    cities: cities.sort(),
    amenities: amenities.sort(),
  });
});

// @route GET /api/properties/:id
export const getProperty = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid property id');
  }

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('owner', 'name avatar email phone createdAt');

  if (!property) throw new ApiError(404, 'Property not found');

  res.json({ success: true, property });
});

// @route GET /api/properties/:id/similar
export const getSimilarProperties = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).lean();
  if (!property) throw new ApiError(404, 'Property not found');

  const properties = await Property.find({
    _id: { $ne: property._id },
    type: property.type,
    status: property.status,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('owner', 'name avatar')
    .lean();

  res.json({ success: true, properties });
});

// @route POST /api/properties
export const createProperty = asyncHandler(async (req, res) => {
  const data = { ...req.body, owner: req.user._id };
  // Only admins can mark a property as featured or set verification
  if (req.user.role !== 'admin') {
    delete data.featured;
    delete data.verification;
  }
  delete data.views;

  const property = await Property.create(data);

  res.status(201).json({ success: true, message: 'Property listed successfully', property });
});

const assertOwnership = (property, user) => {
  if (property.owner.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'You can only manage your own properties');
  }
};

// @route PUT /api/properties/:id
export const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  assertOwnership(property, req.user);

  const updates = { ...req.body };
  delete updates.owner;
  delete updates.views;
  if (req.user.role !== 'admin') {
    delete updates.featured;
    delete updates.verification;
  }

  Object.assign(property, updates);
  await property.save();

  res.json({ success: true, message: 'Property updated successfully', property });
});

// @route DELETE /api/properties/:id
export const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');
  assertOwnership(property, req.user);

  await property.deleteOne();
  await Inquiry.deleteMany({ property: property._id });

  res.json({ success: true, message: 'Property deleted successfully' });
});

// @route GET /api/properties/user/me
export const getMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, properties });
});

// @route POST /api/properties/:id/contact
export const contactSeller = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  const { name, email, phone, message } = req.body;

  const inquiry = await Inquiry.create({
    property: property._id,
    seller: property.owner,
    sender: req.user?._id || null,
    name,
    email,
    phone,
    message,
  });

  await notify(property.owner, {
    type: 'inquiry',
    title: 'New inquiry received',
    message: `${name} is interested in "${property.title}"`,
    link: '/dashboard/listings',
  });

  res.status(201).json({
    success: true,
    message: 'Your message has been sent to the seller',
    inquiry,
  });
});

// @route GET /api/properties/inquiries/me — inquiries for my listings
export const getMyInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate('property', 'title images price status')
    .lean();

  res.json({ success: true, inquiries });
});
