import ActivityLog from '../models/ActivityLog.model.js';
import Notification from '../models/Notification.model.js';

export const log = async (action, performedBy, targetType, targetId, targetName, details = '') => {
  try {
    await ActivityLog.create({ action, performedBy, targetType, targetId, targetName, details });
  } catch {}
};

export const notify = async (userId, title, message, type = 'info', link = null) => {
  try {
    await Notification.create({ userId, title, message, type, link });
  } catch {}
};
