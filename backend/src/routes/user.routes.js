import express from 'express';
import { protect, allow } from '../middleware/auth.js';
import { uploadPhoto } from '../middleware/upload.js';
import {
  createUser, getUsers, getAssociateUsers, getUserById,
  updateUser, deleteUser, getUserTree, uploadProfilePhoto,
  promoteToAdmin, demoteFromAdmin,
} from '../controllers/user.controller.js';

const router = express.Router();
router.use(protect);

router.post('/',                      allow('head_admin', 'admin'), createUser);
router.get('/',                       allow('head_admin', 'admin', 'associate'), getUsers);
router.get('/associates-list',        allow('head_admin'), getAssociateUsers);
router.get('/:id',                    allow('head_admin', 'admin', 'associate'), getUserById);
router.get('/:id/tree',               allow('head_admin', 'admin', 'associate'), getUserTree);
router.patch('/:id',                  allow('head_admin', 'admin', 'associate'), updateUser);
router.post('/:id/photo',             allow('head_admin', 'admin', 'associate'), uploadPhoto, uploadProfilePhoto);
router.delete('/:id',                 allow('head_admin'), deleteUser);
router.post('/:id/promote',           allow('head_admin'), promoteToAdmin);
router.post('/:id/demote',            allow('head_admin'), demoteFromAdmin);

export default router;
