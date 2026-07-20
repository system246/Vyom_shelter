import express from 'express';
import { protect, allow } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { submitAssociate, getAllAssociates, getAssociateById, updateStatus, deleteAssociate, verifyReferral } from '../controllers/associate.controller.js';
const router = express.Router();
router.get('/verify-referral', verifyReferral);                                  // PUBLIC — no protect
router.post('/',           protect, upload, submitAssociate);
router.get('/',            protect, allow('head_admin', 'admin', 'associate'), getAllAssociates);
router.get('/:id',         protect, allow('head_admin', 'admin', 'associate'), getAssociateById);
router.patch('/:id/status',protect, allow('head_admin'), updateStatus);
router.delete('/:id',      protect, allow('head_admin'), deleteAssociate);
export default router;
