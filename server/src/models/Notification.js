import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['inquiry', 'verification', 'system', 'welcome'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

export const notify = async (userId, { type = 'system', title, message, link = '' }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    // Notifications are best-effort; never fail the parent request
    console.error('notify failed:', error.message);
  }
};
