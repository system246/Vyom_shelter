import express from 'express';
import { protect, allow } from '../middleware/auth.js';
import { uploadProperty } from '../middleware/upload.js';
import {
  submitProperty, getProperties, getPropertyById, submitEnquiry,
  getAllPropertiesAdmin, updatePropertyStatus, getAllEnquiries, updateEnquiryStatus,
} from '../controllers/property.controller.js';

const router = express.Router();

// Public — no login required (buyer / seller / tenant)
router.post('/',               uploadProperty, submitProperty);
router.get('/',                getProperties);

// Admin / associate (verification, CRM-lite) — must come before /:id
router.get('/admin/all',               protect, allow('head_admin', 'admin', 'associate'), getAllPropertiesAdmin);
router.get('/admin/enquiries',         protect, allow('head_admin', 'admin', 'associate'), getAllEnquiries);
router.patch('/admin/enquiries/:id/status', protect, allow('head_admin', 'admin', 'associate'), updateEnquiryStatus);

router.get('/:id',             getPropertyById);
router.post('/:id/enquiry',    submitEnquiry);
router.patch('/:id/status',    protect, allow('head_admin', 'admin'), updatePropertyStatus);

export default router;
