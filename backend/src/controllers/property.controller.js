import Property from '../models/Property.model.js';
import Enquiry from '../models/Enquiry.model.js';
import { generatePropertyId, generateEnquiryId } from '../utils/generateId.js';

const fileUrl = (field, file) => `${field}/${file.filename}`;

// POST /api/properties  (PUBLIC — no login required, seller submits a listing)
export const submitProperty = async (req, res, next) => {
  try {
    const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
    const location  = parse(req.body.location);
    const area      = parse(req.body.area);
    const seller    = parse(req.body.seller);
    const ownership = parse(req.body.ownership) || {};
    // Empty strings for optional Number fields cause Mongoose CastError — remove them so schema defaults apply
    if (ownership.numberOfPreviousOwners === '' || ownership.numberOfPreviousOwners === undefined) delete ownership.numberOfPreviousOwners;
    if (ownership.yearOfPurchase === '' || ownership.yearOfPurchase === undefined) delete ownership.yearOfPurchase;

    const facilities       = parse(req.body.facilities) || [];
    const nearbyLandmarks  = parse(req.body.nearbyLandmarks) || [];

    const documents = {};
    ['saleDeed', 'khataKhasra', 'registry', 'taxReceipt', 'ownershipProof', 'encumbranceCertificate'].forEach((f) => {
      if (req.files?.[f]?.[0]) documents[f] = fileUrl(f, req.files[f][0]);
    });

    const images = (req.files?.images || []).map((f) => fileUrl('images', f));
    const video  = req.files?.video?.[0] ? fileUrl('video', req.files.video[0]) : null;

    const property = await Property.create({
      propertyId:   generatePropertyId(),
      listingType:  req.body.listingType,
      propertyType: req.body.propertyType,
      title:        req.body.title,
      description:  req.body.description,
      location,
      area,
      frontRoadWidth: req.body.frontRoadWidth || '',
      facing:         req.body.facing || '',
      facilities,
      nearbyLandmarks,
      price:          Number(req.body.price),
      negotiable:     req.body.negotiable === 'true' || req.body.negotiable === true,
      media: { images, video },
      documents,
      seller,
      ownership,
    });

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
      verifiedOnly, featured,
      page = 1, limit = 12, sort = '-createdAt',
    } = req.query;

    const filter = { status: 'approved' };
    if (listingType)  filter.listingType  = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (city)          filter['location.city'] = new RegExp(city, 'i');
    if (featured === 'true') filter.featured = true;
    if (verifiedOnly === 'false') delete filter.status; // not exposed publicly, kept for future admin use

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
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { 'location.city': new RegExp(q, 'i') },
        { 'location.locality': new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
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
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    if (property.status !== 'approved' && !req.user) return res.status(404).json({ success: false, message: 'Not found' });

    property.views += 1;
    await property.save();

    res.json({ success: true, data: property });
  } catch (err) { next(err); }
};

// POST /api/properties/:id/enquiry  (PUBLIC — buyer/tenant enquiry, no login)
export const submitEnquiry = async (req, res, next) => {
  try {
    const property = await Property.findOne({ propertyId: req.params.id });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const enquiry = await Enquiry.create({
      enquiryId: generateEnquiryId(),
      property: property._id,
      type: req.body.type || 'interest',
      name: req.body.name,
      mobile: req.body.mobile,
      email: req.body.email || '',
      message: req.body.message || '',
      preferredVisitDate: req.body.preferredVisitDate || '',
    });

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
    const { status, rejectionReason, brokeragePercent, featured } = req.body;
    if (status && !['pending', 'approved', 'rejected', 'sold', 'rented'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const update = { reviewedBy: req.user._id };
    if (status) update.status = status;
    if (rejectionReason !== undefined) update.rejectionReason = rejectionReason;
    if (brokeragePercent !== undefined) update.brokeragePercent = brokeragePercent;
    if (featured !== undefined) update.featured = featured;

    const property = await Property.findOneAndUpdate({ propertyId: req.params.id }, update, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });

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
    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiryId: req.params.id }, { status }, { new: true }
    );
    if (!enquiry) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: enquiry });
  } catch (err) { next(err); }
};
