import Associate from '../models/Associate.model.js';
import { generateAssociateId } from '../utils/generateId.js';
import { hasRole } from '../middleware/auth.js';

// POST /api/associates
export const submitAssociate = async (req, res, next) => {
  try {
    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
    const personal     = parse(req.body.personal);
    const professional = parse(req.body.professional);
    const documents    = parse(req.body.documents);
    const bank         = parse(req.body.bank);
    const referral     = parse(req.body.referral);
    const declaration  = parse(req.body.declaration);

    if (req.files?.aadhaarFile?.[0])  documents.aadhaarFile  = `aadhaarFile/${req.files.aadhaarFile[0].filename}`;
    if (req.files?.panFile?.[0])      documents.panFile      = `panFile/${req.files.panFile[0].filename}`;
    if (req.files?.bankDocument?.[0]) documents.bankDocument = `bankDocument/${req.files.bankDocument[0].filename}`;

    const associateId = generateAssociateId();
    const associate = await Associate.create({
      associateId,
      personal, professional, documents, bank, referral, declaration,
      createdByUser: req.user?._id || null,
    });

    // Link associate record back to the user account
    if (req.user?._id) {
      const User = (await import('../models/User.model.js')).default;
      await User.findByIdAndUpdate(req.user._id, { associateRecordId: associate.associateId });
    }

    res.status(201).json({ success: true, message: 'Submitted successfully', associateId: associate.associateId });
  } catch (err) { next(err); }
};

// GET /api/associates/lookup?refNo=XXX  — auto-lookup referral name
export const lookupByRefNo = async (req, res, next) => {
  try {
    const { refNo } = req.query;
    if (!refNo) return res.status(400).json({ success: false, message: 'refNo is required' });

    const associate = await Associate.findOne({ associateId: refNo })
      .select('associateId personal.fullName referral.circle referral.associateName');

    if (!associate)
      return res.status(404).json({ success: false, message: 'No associate found with that referral number' });

    res.json({
      success: true,
      data: {
        associateId:   associate.associateId,
        associateName: associate.personal?.fullName || associate.referral?.associateName || '',
        circle:        associate.referral?.circle || '',
      },
    });
  } catch (err) { next(err); }
};

// GET /api/associates
export const getAllAssociates = async (req, res, next) => {
  try {
    const me = req.user;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Dual-role aware scoping: if user only has associate (not admin/head_admin), scope to own records
    const isAdminOrAbove = hasRole(me, 'head_admin') || hasRole(me, 'admin');
    if (!isAdminOrAbove) filter.createdByUser = me._id;

    if (status) filter.status = status;

    const total = await Associate.countDocuments(filter);
    const data  = await Associate.find(filter)
      .select('-documents.aadhaarFile -documents.panFile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data });
  } catch (err) { next(err); }
};

// GET /api/associates/:id
export const getAssociateById = async (req, res, next) => {
  try {
    const me = req.user;
    const associate = await Associate.findOne({ associateId: req.params.id });
    if (!associate) return res.status(404).json({ success: false, message: 'Not found' });

    // Only restrict if they're a plain associate without admin role
    const isAdminOrAbove = hasRole(me, 'head_admin') || hasRole(me, 'admin');
    if (!isAdminOrAbove && associate.createdByUser?.toString() !== me._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.json({ success: true, data: associate });
  } catch (err) { next(err); }
};

// PATCH /api/associates/:id/status  — head_admin OR admin
export const updateStatus = async (req, res, next) => {
  try {
    const me = req.user;
    if (!hasRole(me, 'head_admin') && !hasRole(me, 'admin'))
      return res.status(403).json({ success: false, message: 'Access denied' });

    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const associate = await Associate.findOneAndUpdate(
      { associateId: req.params.id }, { status }, { new: true }
    );
    if (!associate) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: `Status → ${status}`, data: associate });
  } catch (err) { next(err); }
};

// DELETE /api/associates/:id  — head_admin only
export const deleteAssociate = async (req, res, next) => {
  try {
    if (!hasRole(req.user, 'head_admin'))
      return res.status(403).json({ success: false, message: 'Only head admin can delete' });

    const associate = await Associate.findOneAndDelete({ associateId: req.params.id });
    if (!associate) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};
