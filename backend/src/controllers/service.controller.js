import Service from '../models/Service.model.js';
import { generateServiceId } from '../utils/generateId.js';

// GET /api/services  — PUBLIC (active services with search/filter)
export const getServices = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 12 } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'All') filter.category = category;
    if (q) {
      filter.$or = [
        { title:       new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags:        new RegExp(q, 'i') },
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
    const { title, category, description, tags, providerName, providerPhone, providerDetails } = req.body;
    const image    = req.file ? `serviceImages/${req.file.filename}` : '';
    const tagsArr  = tags ? JSON.parse(tags) : [];

    const service = await Service.create({
      serviceId:       generateServiceId(),
      title,
      category,
      description,
      image,
      tags:            tagsArr,
      providerName:    providerName    || '',
      providerPhone:   providerPhone   || '',
      providerDetails: providerDetails || '',
      addedBy:         req.user._id,
    });

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
    if (tags            !== undefined) update.tags            = JSON.parse(tags);
    if (providerName    !== undefined) update.providerName    = providerName;
    if (providerPhone   !== undefined) update.providerPhone   = providerPhone;
    if (providerDetails !== undefined) update.providerDetails = providerDetails;
    if (status          !== undefined) update.status          = status;
    if (req.file) update.image = `serviceImages/${req.file.filename}`;

    const service = await Service.findOneAndUpdate({ serviceId: req.params.id }, update, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service updated', data: service });
  } catch (err) { next(err); }
};

// DELETE /api/services/:id  — head_admin only
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findOneAndDelete({ serviceId: req.params.id });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { next(err); }
};
