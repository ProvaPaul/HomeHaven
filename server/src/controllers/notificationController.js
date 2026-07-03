import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);

  res.json({ success: true, notifications, unread });
});

// @route PUT /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');

  res.json({ success: true, notification });
});

// @route PUT /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @route DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notification) throw new ApiError(404, 'Notification not found');

  res.json({ success: true, message: 'Notification deleted' });
});
