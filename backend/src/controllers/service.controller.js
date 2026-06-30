import Service from '../models/Service.model.js';
import { generateServiceId } from '../utils/generateId.js';
import { addServiceSchema } from '../validations/schemas.js';
import { logger } from '../utils/logger.js';

// Same ReDoS protection as property.controller.js — escape regex special
// characters in user-supplied search text before it reaches `new RegExp()`.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// JSON.parse can throw on malformed input — this turns that into a clean
// 400 instead of bubbling up as an unhandled SyntaxError.
const safeParseTags = (tags) => {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return null; } // null signals "invalid", caller decides
};

// GET /api/services  — PUBLIC (active services with search/filter)
export const getServices = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 12 } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'All') filter.category = category;
    if (q) {
      const safe = escapeRegex(String(q));
      filter.$or = [
        { title:       new RegExp(safe, 'i') },
        { description: new RegExp(safe, 'i') },
        { tags:        new RegExp(safe, 'i') },
      ];
    }
    const total = await Service.countDocuments(filter);
    const data  = await Service.find(filter)
      .select('-providerPhone -providerDetails -addedBy')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, pages: Math.ceil(total / limit), page: Number(page), data });
  } catch (err) { next(err); }
};

// GET /api/services/admin/all  — head_admin only
export const getAllServicesAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const data = await Service.find(filter)
      .sort({ createdAt: -1 })
      .populate('addedBy', 'name email');
    res.json({ success: true, total: data.length, data });
  } catch (err) { next(err); }
};

// POST /api/services  — head_admin only
export const addService = async (req, res, next) => {
  try {
    const tagsArr = safeParseTags(req.body.tags);
    if (tagsArr === null)
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Tags must be a valid list.' });

    const parsed = addServiceSchema.safeParse({ ...req.body, tags: req.body.tags });
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.name = 'AppValidationError';
      err.errors = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(err);
    }

    const image = req.file ? req.file.path : ''; // Cloudinary's full secure URL

    const service = await Service.create({
      serviceId:       generateServiceId(),
      title:           parsed.data.title,
      category:        parsed.data.category,
      description:     parsed.data.description,
      image,
      tags:            tagsArr,
      providerName:    parsed.data.providerName,
      providerPhone:   parsed.data.providerPhone,
      providerDetails: parsed.data.providerDetails,
      addedBy:         req.user._id,
    });

    logger.success('Service added', { serviceId: service.serviceId, by: req.user._id?.toString() });
    res.status(201).json({ success: true, message: 'Service added successfully', data: service });
  } catch (err) { next(err); }
};

// PATCH /api/services/:id  — head_admin only (update fields or toggle status)
export const updateService = async (req, res, next) => {
  try {
    const { title, category, description, tags, providerName, providerPhone, providerDetails, status } = req.body;
    const update = {};
    if (title           !== undefined) update.title           = title;
    if (category        !== undefined) update.category        = category;
    if (description     !== undefined) update.description     = description;
    if (providerName    !== undefined) update.providerName    = providerName;
    if (providerPhone   !== undefined) update.providerPhone   = providerPhone;
    if (providerDetails !== undefined) update.providerDetails = providerDetails;
    if (status          !== undefined) update.status          = status;

    if (tags !== undefined) {
      const tagsArr = safeParseTags(tags);
      if (tagsArr === null)
        return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Tags must be a valid list.' });
      update.tags = tagsArr;
    }
    if (req.file) update.image = req.file.path; // Cloudinary's full secure URL

    const service = await Service.findOneAndUpdate({ serviceId: req.params.id }, update, { new: true });
    if (!service) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Service not found.' });

    logger.info('Service updated', { serviceId: service.serviceId, by: req.user._id?.toString() });
    res.json({ success: true, message: 'Service updated', data: service });
  } catch (err) { next(err); }
};

// DELETE /api/services/:id  — head_admin only
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findOneAndDelete({ serviceId: req.params.id });
    if (!service) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Service not found.' });
    logger.warn('Service deleted', { serviceId: service.serviceId, by: req.user._id?.toString() });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};
