import express from 'express';
import { protect } from '../middleware/auth.js';
import { getActivityLog } from '../controllers/notification.controller.js';
const router = express.Router();
router.get('/', protect, getActivityLog);
export default router;
