import mongoose from 'mongoose';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import Notification, { notify } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const monthsBack = (n) => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - (n - 1));
  return d;
};

const denseMonths = (rows, n) => {
  const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    out.push({ month: key, count: map[key] || 0 });
  }
  return out;
};

// @route GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    users,
    properties,
    inquiries,
    viewsAgg,
    pendingVerification,
    usersByMonth,
    listingsByType,
    listingsByStatus,
    topCities,
    recentUsers,
    recentListings,
  ] = await Promise.all([
    User.countDocuments(),
    Property.countDocuments(),
    Inquiry.countDocuments(),
    Property.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Property.countDocuments({ verification: 'pending' }),
    User.aggregate([
      { $match: { createdAt: { $gte: monthsBack(6) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    Property.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Property.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Property.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt').lean(),
    Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title price status verification createdAt')
      .populate('owner', 'name')
      .lean(),
  ]);

  res.json({
    success: true,
    totals: {
      users,
      properties,
      inquiries,
      views: viewsAgg[0]?.total || 0,
      pendingVerification,
    },
    usersByMonth: denseMonths(usersByMonth, 6),
    listingsByType: listingsByType.map((r) => ({ type: r._id, count: r.count })),
    listingsByStatus: listingsByStatus.map((r) => ({ status: r._id, count: r.count })),
    topCities: topCities.map((r) => ({
      city: r._id,
      count: r.count,
      avgPrice: Math.round(r.avgPrice || 0),
    })),
    recentUsers,
    recentListings,
  });
});

// @route GET /api/admin/users?q=&page=&limit=
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter = {};
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (req.query.role && ['user', 'agent', 'admin'].includes(req.query.role)) {
    filter.role = req.query.role;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email role avatar createdAt')
      .lean(),
    User.countDocuments(filter),
  ]);

  // Attach listing counts in one aggregate instead of N queries
  const counts = await Property.aggregate([
    { $match: { owner: { $in: users.map((u) => u._id) } } },
    { $group: { _id: '$owner', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
  const withCounts = users.map((u) => ({ ...u, listings: countMap[u._id.toString()] || 0 }));

  res.json({
    success: true,
    users: withCounts,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

// @route PUT /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'agent', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');

  res.json({ success: true, message: `Role updated to ${role}`, user });
});

// @route DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  const properties = await Property.find({ owner: user._id }).select('_id');
  const propertyIds = properties.map((p) => p._id);

  await Promise.all([
    Property.deleteMany({ owner: user._id }),
    Inquiry.deleteMany({ $or: [{ seller: user._id }, { property: { $in: propertyIds } }] }),
    Notification.deleteMany({ user: user._id }),
    user.deleteOne(),
  ]);

  res.json({ success: true, message: 'User and their listings deleted' });
});

// @route GET /api/admin/properties?verification=&q=&page=&limit=
export const getAdminProperties = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filter = {};
  if (req.query.verification && ['pending', 'approved', 'rejected'].includes(req.query.verification)) {
    filter.verification = req.query.verification;
  }
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { 'address.city': rx }];
  }

  const [properties, total] = await Promise.all([
    Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('owner', 'name email')
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

// @route PUT /api/admin/properties/:id/verify  { action: 'approved' | 'rejected' | 'pending' }
export const verifyProperty = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(action)) {
    throw new ApiError(400, 'Action must be approved, rejected, or pending');
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid property id');
  }

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { verification: action },
    { new: true }
  ).populate('owner', 'name');
  if (!property) throw new ApiError(404, 'Property not found');

  if (action !== 'pending') {
    await notify(property.owner._id, {
      type: 'verification',
      title: action === 'approved' ? 'Listing approved ✅' : 'Listing rejected',
      message:
        action === 'approved'
          ? `"${property.title}" has been verified and is now highlighted as a verified listing.`
          : `"${property.title}" was rejected and is hidden from public search. Contact support for details.`,
      link: `/properties/${property._id}`,
    });
  }

  res.json({ success: true, message: `Property ${action}`, property });
});

// @route PUT /api/admin/properties/:id/feature — toggle featured
export const toggleFeatured = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found');

  property.featured = !property.featured;
  await property.save();

  res.json({
    success: true,
    message: property.featured ? 'Marked as featured' : 'Removed from featured',
    property,
  });
});
