import Property from '../models/Property.model.js';
import Enquiry from '../models/Enquiry.model.js';
import { generatePropertyId, generateEnquiryId } from '../utils/generateId.js';
import { submitPropertySchema, submitEnquirySchema, updatePropertyStatusSchema } from '../validations/schemas.js';
import { logger } from '../utils/logger.js';

const fileUrl = (field, file) => file.path; // Cloudinary's full secure URL

// Escapes regex special characters in user-supplied search text before it's
// used inside `new RegExp()`. Without this, a crafted search query (e.g.
// repeated nested groups) can cause catastrophic backtracking — a ReDoS
// attack that can hang the server on a single request.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/properties  (PUBLIC — no login required, seller submits a listing)
export const submitProperty = async (req, res, next) => {
  try {
    const parse = (v) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return undefined; } };

    const ownership = parse(req.body.ownership) || {};
    // Empty strings for optional Number fields cause Mongoose CastError — remove them so schema defaults apply
    if (ownership.numberOfPreviousOwners === '' || ownership.numberOfPreviousOwners === undefined) delete ownership.numberOfPreviousOwners;
    if (ownership.yearOfPurchase === '' || ownership.yearOfPurchase === undefined) delete ownership.yearOfPurchase;

    // Validate the parsed multipart payload against the single source of
    // truth (validations/schemas.js) — same rules the frontend form already
    // enforces, but here they actually can't be bypassed.
    const parsed = submitPropertySchema.safeParse({
      listingType:  req.body.listingType,
      propertyType: req.body.propertyType,
      title:        req.body.title,
      description:  req.body.description,
      location:     parse(req.body.location),
      area:         parse(req.body.area),
      frontRoadWidth: req.body.frontRoadWidth,
      facing:         req.body.facing,
      facilities:      parse(req.body.facilities),
      nearbyLandmarks: parse(req.body.nearbyLandmarks),
      price:      req.body.price,
      negotiable: req.body.negotiable,
      seller:     parse(req.body.seller),
      ownership,
    });

    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.name = 'AppValidationError';
      err.errors = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(err);
    }
    const data = parsed.data;

    const documents = {};
    ['saleDeed', 'khataKhasra', 'registry', 'taxReceipt', 'ownershipProof', 'encumbranceCertificate'].forEach((f) => {
      if (req.files?.[f]?.[0]) documents[f] = fileUrl(f, req.files[f][0]);
    });

    const images = (req.files?.images || []).map((f) => fileUrl('images', f));
    const video  = req.files?.video?.[0] ? fileUrl('video', req.files.video[0]) : null;

    const property = await Property.create({
      propertyId: generatePropertyId(),
      ...data,
      media: { images, video },
      documents,
    });

    logger.success('Property submitted', { propertyId: property.propertyId, city: data.location.city });

    res.status(201).json({
      success: true,
      message: 'Property submitted! Our team will verify it shortly.',
      propertyId: property.propertyId,
    });
  } catch (err) { next(err); }
};

// GET /api/properties  (PUBLIC — search/browse approved listings)
export const getProperties = async (req, res, next) => {
  try {
    const {
      listingType, propertyType, city, q,
      minPrice, maxPrice, minArea, maxArea,
      verifiedOnly, featured, isExclusive,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const filter = { status: 'approved' };
    if (listingType)  filter.listingType  = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (city)          filter['location.city'] = new RegExp(escapeRegex(String(city)), 'i');
    if (featured === 'true')    filter.featured    = true;
    if (isExclusive === 'true') filter.isExclusive = true;
    if (verifiedOnly === 'false') delete filter.status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minArea || maxArea) {
      filter['area.value'] = {};
      if (minArea) filter['area.value'].$gte = Number(minArea);
      if (maxArea) filter['area.value'].$lte = Number(maxArea);
    }
    if (q) {
      const safe = escapeRegex(String(q));
      filter.$or = [
        { title: new RegExp(safe, 'i') },
        { 'location.city': new RegExp(safe, 'i') },
        { 'location.locality': new RegExp(safe, 'i') },
        { description: new RegExp(safe, 'i') },
      ];
    }

    const total = await Property.countDocuments(filter);
    const data  = await Property.find(filter)
      .select('-documents -seller.email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data });
  } catch (err) { next(err); }
};

// GET /api/properties/:id  (PUBLIC)
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findOne({ propertyId: req.params.id }).select('-documents -seller.email -seller.mobile');
    if (!property) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Property not found or no longer available.' });
    if (property.status !== 'approved' && !req.user)
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Property not found or no longer available.' });

    property.views += 1;
    await property.save();

    res.json({ success: true, data: property });
  } catch (err) { next(err); }
};

// POST /api/properties/:id/enquiry  (PUBLIC — buyer/tenant enquiry, no login)
export const submitEnquiry = async (req, res, next) => {
  try {
    const parsed = submitEnquirySchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.name = 'AppValidationError';
      err.errors = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(err);
    }

    const property = await Property.findOne({ propertyId: req.params.id });
    if (!property) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Property not found.' });

    const enquiry = await Enquiry.create({
      enquiryId: generateEnquiryId(),
      property: property._id,
      ...parsed.data,
    });

    logger.info('Enquiry submitted', { enquiryId: enquiry.enquiryId, propertyId: property.propertyId, type: enquiry.type });

    res.status(201).json({ success: true, message: 'Enquiry submitted. Our team will contact you soon.', enquiryId: enquiry.enquiryId });
  } catch (err) { next(err); }
};

// ---------- ADMIN / ASSOCIATE (protected) ----------

// GET /api/properties/admin/all
export const getAllPropertiesAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Property.countDocuments(filter);
    const data  = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data });
  } catch (err) { next(err); }
};

// PATCH /api/properties/:id/status  — verify/approve/reject
export const updatePropertyStatus = async (req, res, next) => {
  try {
    const parsed = updatePropertyStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.name = 'AppValidationError';
      err.errors = parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(err);
    }
    const { status, rejectionReason, brokeragePercent, featured, isExclusive } = parsed.data;

    const update = { reviewedBy: req.user._id };
    if (status !== undefined)          update.status          = status;
    if (rejectionReason !== undefined)  update.rejectionReason = rejectionReason;
    if (brokeragePercent !== undefined) update.brokeragePercent = brokeragePercent;
    if (featured !== undefined)         update.featured        = featured;
    if (isExclusive !== undefined)      update.isExclusive     = isExclusive;

    const property = await Property.findOneAndUpdate({ propertyId: req.params.id }, update, { new: true });
    if (!property) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Property not found.' });

    logger.info('Property status updated', { propertyId: property.propertyId, status, by: req.user._id?.toString() });

    res.json({ success: true, message: 'Property updated', data: property });
  } catch (err) { next(err); }
};

// GET /api/properties/admin/enquiries
export const getAllEnquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Enquiry.countDocuments(filter);
    const data  = await Enquiry.find(filter)
      .populate('property', 'propertyId title location price listingType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data });
  } catch (err) { next(err); }
};

// PATCH /api/properties/admin/enquiries/:id/status
export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'site_visit_scheduled', 'closed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: `Status must be one of: ${allowed.join(', ')}` });

    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiryId: req.params.id }, { status }, { new: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Enquiry not found.' });
    res.json({ success: true, data: enquiry });
  } catch (err) { next(err); }
};
