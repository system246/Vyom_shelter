import { log, notify } from '../utils/activity.js';
import User from '../models/User.model.js';
import { sendApprovalNotification } from '../utils/mailer.js';
import { hasRole } from '../middleware/auth.js';

// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, profile } = req.body;
    const creator = req.user;

    if (role === 'head_admin')
      return res.status(403).json({ success: false, message: 'Cannot create another head admin' });
    if (role === 'admin' && !hasRole(creator, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can create admins' });
    if (role === 'associate' && !hasRole(creator, 'head_admin') && !hasRole(creator, 'admin'))
      return res.status(403).json({ success: false, message: 'No permission to create associates' });

    const user = await User.create({
      email, password, role,
      profile: profile || { fullName: email },
      createdBy:  creator._id,
      isVerified: true,
      isActive:   true,
    });

    res.status(201).json({ success: true, message: `${role} created`, user });
  } catch (err) { next(err); }
};

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const me = req.user;
    let filter = {};

    if (hasRole(me, 'head_admin')) {
      filter = { _id: { $ne: me._id } };
    } else if (hasRole(me, 'admin')) {
      filter = { createdBy: me._id };
    } else {
      return res.json({ success: true, data: [me] });
    }

    const { role, pending } = req.query;
    if (role) filter.role = role;
    if (pending === 'true' && hasRole(me, 'head_admin')) {
      // Find self-registered users who have submitted a form (associateRecordId set)
      // The pending state is now tracked on the associate record, not the user
      // We fetch users with associateRecordId and let frontend/associate API check status
      filter = { isVerified: true, isSelfRegistered: true, associateRecordId: { $ne: null } };
    }

    const users = await User.find(filter)
      .populate('createdBy', 'profile.fullName email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// GET /api/users/associates-list  — associates eligible for promotion (head_admin only)
export const getAssociateUsers = async (req, res, next) => {
  try {
    if (!hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can access this' });

    const { search = '' } = req.query;
    const filter = {
      role: 'associate',
      isActive: true,
    };
    if (search) {
      filter.$or = [
        { 'profile.fullName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('profile email role roles createdAt')
      .sort({ 'profile.fullName': 1 });

    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// POST /api/users/:id/promote  — head_admin promotes associate → gains admin role too
export const promoteToAdmin = async (req, res, next) => {
  try {
    if (!hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can promote users' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role !== 'associate')
      return res.status(400).json({ success: false, message: 'Only associates can be promoted to admin' });

    if (user.roles?.includes('admin'))
      return res.status(400).json({ success: false, message: 'User is already an admin' });

    // Add 'admin' to extra roles — keeps primary role as 'associate'
    user.roles = [...new Set([...(user.roles || []), 'admin'])];
    await user.save();

    await log('PROMOTE_USER', req.user._id, 'User', user._id, user.profile.fullName, 'Promoted to admin (dual role)');
    await notify(user._id, 'You have been promoted!', 'You now have admin permissions in addition to your associate role.', 'success', '/admin/dashboard');

    res.json({ success: true, message: `${user.profile.fullName} promoted to admin`, user });
  } catch (err) { next(err); }
};

// POST /api/users/:id/demote  — head_admin removes admin role from associate
export const demoteFromAdmin = async (req, res, next) => {
  try {
    if (!hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can demote users' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.roles = (user.roles || []).filter(r => r !== 'admin');
    await user.save();

    res.json({ success: true, message: `${user.profile.fullName} demoted`, user });
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
    if (me.role === 'admin' && !hasRole(me, 'head_admin')) {
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

    if (me.role === 'admin' && !hasRole(me, 'head_admin')) {
      const isChild = user.createdBy?.toString() === me._id.toString();
      const isSelf  = me._id.toString() === req.params.id;
      if (!isChild && !isSelf) return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (me.role === 'associate' && me._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (profile)  user.profile = { ...user.profile, ...profile };
    if (password) user.password = password;

    if (isActive !== undefined && hasRole(me, 'head_admin')) {
      const wasInactive = !user.isActive;
      user.isActive = isActive;
      await user.save();
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
    if (!hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can delete users' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// GET /api/users/:id/tree
export const getUserTree = async (req, res, next) => {
  try {
    const me       = req.user;
    const targetId = me.role === 'associate' ? me._id : req.params.id;
    const direct   = await User.find({ createdBy: targetId }).select('profile email role roles createdAt isActive');
    const tree = await Promise.all(
      direct.map(async (child) => {
        const grandchildren = await User.find({ createdBy: child._id }).select('profile email role roles createdAt isActive');
        return { ...child.toJSON(), children: grandchildren };
      })
    );
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
};

// POST /api/users/:id/photo
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.user._id.toString() !== req.params.id && !hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Access denied' });

    user.profile.photoUrl = `profilePhoto/${req.file.filename}`;
    await user.save();

    res.json({ success: true, photoUrl: user.profile.photoUrl, message: 'Photo updated' });
  } catch (err) { next(err); }
};
