import Associate from '../models/Associate.model.js';
import { generateAssociateId, generateCandidateRefNo } from '../utils/generateId.js';
import {
  associatePersonalSchema, associateProfessionalSchema,
  associateDocumentSchema, associateBankSchema, associateReferralSchema,
} from '../validations/schemas.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

// JSON.parse can throw on malformed multipart fields — wrap so a bad
// request gets a clean 400 instead of a raw SyntaxError leaking to the
// generic 500 path.
const safeParse = (v) => {
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return undefined; }
};

const declarationSchema = z.object({ acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms & conditions' }) }) });

// POST /api/associates
export const submitAssociate = async (req, res, next) => {
  try {
    const personal     = safeParse(req.body.personal);
    const professional = safeParse(req.body.professional);
    const documents     = safeParse(req.body.documents) || {};
    const bank          = safeParse(req.body.bank);
    const referral       = safeParse(req.body.referral);
    const declaration    = safeParse(req.body.declaration);

    const checks = [
      ['personal', associatePersonalSchema, personal],
      ['professional', associateProfessionalSchema, professional],
      ['documents', associateDocumentSchema, documents],
      ['bank', associateBankSchema, bank],
      ['referral', associateReferralSchema, referral],
      ['declaration', declarationSchema, declaration],
    ];

    const errors = [];
    for (const [section, schema, value] of checks) {
      const result = schema.safeParse(value);
      if (!result.success) {
        result.error.issues.forEach((issue) =>
          errors.push({ field: `${section}.${issue.path.join('.')}`, message: issue.message })
        );
      }
    }
    if (errors.length) {
      const err = new Error('Validation failed');
      err.name = 'AppValidationError';
      err.errors = errors;
      return next(err);
    }

    if (req.files?.aadhaarFile?.[0])  documents.aadhaarFile  = req.files.aadhaarFile[0].path;
    if (req.files?.panFile?.[0])      documents.panFile      = req.files.panFile[0].path;
    if (req.files?.bankDocument?.[0]) bank.bankDocument       = req.files.bankDocument[0].path;

    const associateId = generateAssociateId();
    const associate = await Associate.create({
      associateId,
      personal, professional, documents, bank, referral, declaration,
      createdByUser: req.user?._id || null,
    });

    // Link the User account to this record so My Profile / ID Card can show
    // it — but only when the associate is submitting their own form, not
    // when an admin is registering a walk-in associate on someone's behalf.
    if (req.user?.role === 'associate' && !req.user.associateRecordId) {
      req.user.associateRecordId = associateId;
      await req.user.save();
    }

    logger.success('Associate registration submitted', { associateId, by: req.user?._id?.toString() });
    res.status(201).json({ success: true, message: 'Submitted successfully', associateId: associate.associateId });
  } catch (err) { next(err); }
};

// GET /api/associates
export const getAllAssociates = async (req, res, next) => {
  try {
    const me = req.user;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Scope: admin/associate only see their own records
    if (me?.role === 'admin')     filter.createdByUser = me._id;
    if (me?.role === 'associate') filter.createdByUser = me._id;

    if (status) filter.status = status;

    const total = await Associate.countDocuments(filter);
    const data  = await Associate.find(filter)
      .select('-documents.aadhaarFile -documents.panFile -bank.accountNumber -bank.bankDocument')
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
    if (!associate) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Associate record not found.' });

    // Access control — every non-head_admin role is restricted to records
    // they created/own. Previously this only checked the 'admin' role and
    // silently let ANY associate view ANY other associate's full record
    // (Aadhaar number, PAN number, bank account number, uploaded document
    // URLs) just by changing the ID in the URL. Fixed: associate role is
    // now checked too, against both createdByUser and their own linked record.
    if (me?.role === 'admin' && associate.createdByUser?.toString() !== me._id.toString())
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Access denied' });

    if (me?.role === 'associate') {
      const isOwnRecord =
        associate.createdByUser?.toString() === me._id.toString() ||
        associate.associateId === me.associateRecordId;
      if (!isOwnRecord)
        return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Access denied' });
    }

    res.json({ success: true, data: associate });
  } catch (err) { next(err); }
};

// PATCH /api/associates/:id/status  — head_admin only
export const updateStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only head admin can update status' });

    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Invalid status' });

    const update = { status };
    // The candidate's own referral code is only created the moment they're
    // approved — a rejected/pending applicant should never hold a working
    // code they could hand out to someone else.
    if (status === 'approved') {
      const existing = await Associate.findOne({ associateId: req.params.id });
      if (existing && !existing.referral?.newCandidateRefNo) {
        update['referral.newCandidateRefNo'] = generateCandidateRefNo();
      }
    }

    const associate = await Associate.findOneAndUpdate(
      { associateId: req.params.id }, update, { new: true }
    );
    if (!associate) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Associate record not found.' });

    logger.info('Associate status updated', { associateId: associate.associateId, status, by: req.user._id.toString() });
    res.json({ success: true, message: `Status → ${status}`, data: associate });
  } catch (err) { next(err); }
};

// DELETE /api/associates/:id  — head_admin only
export const deleteAssociate = async (req, res, next) => {
  try {
    if (req.user.role !== 'head_admin')
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Only head admin can delete' });

    const associate = await Associate.findOneAndDelete({ associateId: req.params.id });
    if (!associate) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Associate record not found.' });

    logger.warn('Associate record deleted', { associateId: associate.associateId, by: req.user._id.toString() });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// GET /api/associates/verify-referral?code=ASC123456  — PUBLIC (no login,
// since the person registering doesn't have an account yet). Returns the
// referrer's name so the form can auto-fill it and the applicant can
// visually confirm the code is real before submitting.
export const verifyReferral = async (req, res, next) => {
  try {
    const code = req.query.code?.trim();
    if (!code) return res.status(400).json({ success: false, message: 'Referral code required' });

    const associate = await Associate.findOne(
      { 'referral.newCandidateRefNo': code, status: 'approved' },
      { 'personal.fullName': 1, associateId: 1 }
    );

    if (!associate)
      return res.status(404).json({ success: false, message: 'Referral code not found or associate not yet approved' });

    res.json({ success: true, data: { name: associate.personal.fullName, associateId: associate.associateId } });
  } catch (err) { next(err); }
};
