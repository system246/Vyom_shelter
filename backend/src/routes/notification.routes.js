import express from 'express';
import { protect } from '../middleware/auth.js';
import { getNotifications, markAllRead, markRead, getActivityLog } from '../controllers/notification.controller.js';
const router = express.Router();
router.use(protect);
router.get('/',              getNotifications);
router.patch('/read-all',    markAllRead);
router.patch('/:id/read',    markRead);
export default router;
