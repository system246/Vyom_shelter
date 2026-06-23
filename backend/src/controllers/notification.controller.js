import Notification from '../models/Notification.model.js';
import ActivityLog from '../models/ActivityLog.model.js';

// GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, data: notifications, unread });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read
export const markRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /api/activity-log (head_admin only)
export const getActivityLog = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, message: 'Access denied' });
    const logs = await ActivityLog.find()
      .populate('performedBy', 'profile.fullName email role')
      .sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};
