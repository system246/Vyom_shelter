import { log, notify } from '../utils/activity.js';
import User from '../models/User.model.js';
import { sendApprovalNotification } from '../utils/mailer.js';
import { logger } from '../utils/logger.js';

// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, profile } = req.body;
    const creator = req.user;

    if (role === 'head_admin')
      return res.status(403).json({ success: false, message: 'Cannot create another head admin' });
    if (role === 'admin' && creator.role !== 'head_admin')
      return res.status(403).json({ success: false, message: 'Only head admin can create admins' });
    if (role === 'associate' && !['head_admin', 'admin'].includes(creator.role))
      return res.status(403).json({ success: false, message: 'No permission to create associates' });

    const user = await User.create({
      email, password, role,
      profile: profile || { fullName: email },
      createdBy:  creator._id,
      isVerified: true,  // admin-created users are pre-verified
      isActive:   true,  // admin-created users are pre-approved
    });

    res.status(201).json({ success: true, message: `${role} created`, user });
  } catch (err) { next(err); }
};

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const me = req.user;
    let filter = {};

    if (me.role === 'head_admin') {
      filter = { _id: { $ne: me._id } };
    } else if (me.role === 'admin') {
      filter = { createdBy: me._id };
    } else {
      return res.json({ success: true, data: [me] });
    }

    const { role, pending } = req.query;
    if (role) filter.role = role;
    // head_admin can see pending self-registered users
    if (pending === 'true' && me.role === 'head_admin') {
      filter = { isVerified: true, isActive: false, isSelfRegistered: true };
    }

    const users = await User.find(filter)
      .populate('createdBy', 'profile.fullName email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const me   = req.user;
    const user = await User.findById(req.params.id).populate('createdBy', 'profile.fullName email role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (me.role === 'associate' && me._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied' });
    if (me.role === 'admin') {
      const isOwn   = me._id.toString() === req.params.id;
      const isChild = user.createdBy?._id?.toString() === me._id.toString();
      if (!isOwn && !isChild) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const me = req.user;
    const { profile, password, isActive } = req.body;

    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (me.role === 'admin') {
      const isChild = user.createdBy?.toString() === me._id.toString();
      const isSelf  = me._id.toString() === req.params.id;
      if (!isChild && !isSelf) return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (me.role === 'associate' && me._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (profile)  user.profile = { ...user.profile, ...profile };
    if (password) user.password = password;

    // Head admin approving a pending user
    if (isActive !== undefined && me.role === 'head_admin') {
      const wasInactive = !user.isActive;
      user.isActive = isActive;
      await user.save();
      // Send approval email if just approved
      if (isActive && wasInactive) {
        try { await sendApprovalNotification(user.email, user.profile.fullName); } catch {}
        await log('APPROVE_USER', me._id, 'User', user._id, user.profile.fullName, 'Account approved');
        await notify(user._id, 'Account Approved!', 'Your account has been approved. You can now login.', 'success', '/my-profile');
      }
      return res.json({ success: true, message: 'User updated', user });
    }

    await user.save();
    res.json({ success: true, message: 'User updated', user });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only head admin can delete users' });

    // Without this guard, the head admin could delete their own account —
    // there's no path to create a second head_admin (signup only ever
    // creates 'associate' accounts), so that would permanently lock
    // everyone out of admin access with no recovery.
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, code: 'CANNOT_DELETE_SELF', message: 'You cannot delete your own account.' });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'User not found' });
    if (target.role === 'head_admin')
      return res.status(400).json({ success: false, code: 'CANNOT_DELETE_HEAD_ADMIN', message: 'The head admin account cannot be deleted.' });

    await target.deleteOne();
    logger.warn('User deleted', { deletedUser: target._id.toString(), deletedRole: target.role, by: req.user._id.toString() });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// GET /api/users/:id/tree — recursive, includes associate records as leaf nodes
export const getUserTree = async (req, res, next) => {
  try {
    const me       = req.user;

    // Associates have no tree — this route is for head_admin and admin only
    if (me.role === 'associate')
      return res.json({ success: true, data: [] });

    const rootId = me.role === 'head_admin' ? req.params.id : me._id;

    // Recursive builder — no fixed depth limit
    const buildTree = async (parentId, depth = 0) => {
      if (depth > 8) return []; // safety cap against circular references
      const children = await User.find({ createdBy: parentId })
        .select('profile email role createdAt isActive associateRecordId')
        .lean();

      return Promise.all(children.map(async (child) => {
        const subChildren = await buildTree(child._id, depth + 1);

        // Attach the associate registration record (name, status, referral
        // code) if this user has one — so the tree shows real membership data
        let associateRecord = null;
        if (child.associateRecordId) {
          const { default: Associate } = await import('../models/Associate.model.js');
          associateRecord = await Associate.findOne(
            { associateId: child.associateRecordId },
            { status: 1, 'referral.newCandidateRefNo': 1, associateId: 1 }
          ).lean();
        }

        return { ...child, children: subChildren, associateRecord };
      }));
    };

    const tree = await buildTree(rootId);
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
};

// POST /api/users/:id/photo — upload profile photo
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Only self or head_admin can update photo
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, message: 'Access denied' });

    user.profile.photoUrl = req.file.path; // Cloudinary's full secure URL
    await user.save();

    res.json({ success: true, photoUrl: user.profile.photoUrl, message: 'Photo updated' });
  } catch (err) { next(err); }
};
