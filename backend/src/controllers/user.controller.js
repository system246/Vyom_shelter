import User from '../models/User.model.js';

// POST /api/users  — head_admin creates admin, head_admin/admin creates associate
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, profile } = req.body;
    const creator = req.user;

    // Permission rules
    if (role === 'head_admin')
      return res.status(403).json({ success: false, message: 'Cannot create another head admin' });
    if (role === 'admin' && creator.role !== 'head_admin')
      return res.status(403).json({ success: false, message: 'Only head admin can create admins' });
    if (role === 'associate' && !['head_admin', 'admin'].includes(creator.role))
      return res.status(403).json({ success: false, message: 'No permission to create associates' });

    const user = await User.create({
      email, password, role,
      profile: profile || { fullName: email },
      createdBy: creator._id,
    });

    res.status(201).json({ success: true, message: `${role} created`, user });
  } catch (err) { next(err); }
};

// GET /api/users  — scoped by role
export const getUsers = async (req, res, next) => {
  try {
    const me = req.user;
    let filter = {};

    if (me.role === 'head_admin') {
      // See everyone except self
      filter = { _id: { $ne: me._id } };
    } else if (me.role === 'admin') {
      // See only users they created
      filter = { createdBy: me._id };
    } else {
      // Associate: see only themselves
      return res.json({ success: true, data: [me] });
    }

    const { role } = req.query;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .populate('createdBy', 'profile.fullName email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const me = req.user;
    const user = await User.findById(req.params.id)
      .populate('createdBy', 'profile.fullName email role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Access control
    if (me.role === 'associate' && me._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied' });
    if (me.role === 'admin') {
      const isOwn = me._id.toString() === req.params.id;
      const isChild = user.createdBy?._id?.toString() === me._id.toString();
      if (!isOwn && !isChild)
        return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id  — update profile / password / status
export const updateUser = async (req, res, next) => {
  try {
    const me = req.user;
    const { profile, password, isActive } = req.body;

    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Only head_admin can update anyone; admin can update their own associates; associate can update only self
    if (me.role === 'admin') {
      const isChild = user.createdBy?.toString() === me._id.toString();
      const isSelf  = me._id.toString() === req.params.id;
      if (!isChild && !isSelf)
        return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (me.role === 'associate' && me._id.toString() !== req.params.id)
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (profile)   user.profile = { ...user.profile, ...profile };
    if (password)  user.password = password; // pre-save hook rehashes
    if (isActive !== undefined && me.role === 'head_admin') user.isActive = isActive;

    await user.save();
    res.json({ success: true, message: 'User updated', user });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id — head_admin only
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, message: 'Only head admin can delete users' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// GET /api/users/:id/tree  — tree of users created by this user
export const getUserTree = async (req, res, next) => {
  try {
    const me = req.user;
    // Associates can only see their own tree
    const targetId = me.role === 'associate' ? me._id : req.params.id;

    const directChildren = await User.find({ createdBy: targetId })
      .select('profile email role createdAt isActive');

    // For each child, get their children (2 levels deep is enough for now)
    const tree = await Promise.all(
      directChildren.map(async (child) => {
        const grandchildren = await User.find({ createdBy: child._id })
          .select('profile email role createdAt isActive');
        return { ...child.toJSON(), children: grandchildren };
      })
    );

    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
};
