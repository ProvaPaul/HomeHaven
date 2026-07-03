import User from '../models/User.js';
import Property from '../models/Property.js';
import Inquiry from '../models/Inquiry.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const lastNDays = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (n - 1));
  return d;
};

// Fill a [{_id: 'YYYY-MM-DD', count}] aggregation into a dense day series
const denseDays = (rows, days) => {
  const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map[key] || 0 });
  }
  return out;
};

// @route GET /api/dashboard/me
export const getMyDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [listings, viewsAgg, inquiriesCount, user, byStatus, topListings, inquiriesByDay] =
    await Promise.all([
      Property.countDocuments({ owner: userId }),
      Property.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      Inquiry.countDocuments({ seller: userId }),
      User.findById(userId).select('favorites savedSearches'),
      Property.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Property.find({ owner: userId }).sort({ views: -1 }).limit(5).select('title views').lean(),
      Inquiry.aggregate([
        { $match: { seller: userId, createdAt: { $gte: lastNDays(30) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  res.json({
    success: true,
    stats: {
      listings,
      totalViews: viewsAgg[0]?.total || 0,
      inquiries: inquiriesCount,
      favorites: user.favorites.length,
      savedSearches: user.savedSearches.length,
    },
    listingsByStatus: byStatus.map((r) => ({ status: r._id, count: r.count })),
    topListings,
    inquiriesByDay: denseDays(inquiriesByDay, 30),
  });
});
