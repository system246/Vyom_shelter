import Notification from '../models/Notification.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import { logger } from '../utils/logger.js';

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
    // Scoped to userId as well as _id — without this, any logged-in user
    // could mark ANY other user's notification as read just by guessing/
    // incrementing the ID in the URL (an IDOR vulnerability). Low impact
    // here (only flips a read flag, no data exposure) but still a real
    // cross-account write with no authorization check.
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Notification not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// GET /api/activity-log (head_admin only)
export const getActivityLog = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Access denied' });
    const logs = await ActivityLog.find()
      .populate('performedBy', 'profile.fullName email role')
      .sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};
