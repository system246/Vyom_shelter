import express from 'express';
import { protect, allow } from '../middleware/auth.js';
import { uploadServiceImage } from '../middleware/upload.js';
import {
  getServices, getAllServicesAdmin,
  addService, updateService, deleteService,
} from '../controllers/service.controller.js';

const router = express.Router();

// Public — browse active services (no login required)
router.get('/', getServices);

// head_admin only — admin management (must come before /:id)
router.get('/admin/all',  protect, allow('head_admin'), getAllServicesAdmin);
router.post('/',          protect, allow('head_admin'), uploadServiceImage, addService);
router.patch('/:id',      protect, allow('head_admin'), uploadServiceImage, updateService);
router.delete('/:id',     protect, allow('head_admin'), deleteService);

export default router;
