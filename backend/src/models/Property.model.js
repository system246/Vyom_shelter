import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    propertyId: { type: String, required: true, unique: true, index: true },

    // Sale or Rent
    listingType: { type: String, enum: ['sale', 'rent'], required: true, index: true },

    propertyType: {
      type: String,
      enum: ['plot', 'residential_house', 'flat', 'commercial_shop', 'agricultural_land', 'farm_house'],
      required: true,
      index: true,
    },

    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    location: {
      state:    { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      city:     { type: String, required: true, trim: true, index: true },
      locality: { type: String, required: true, trim: true },
      address:  { type: String, required: true, trim: true },
      pincode:  { type: String, required: true, trim: true },
      lat:      { type: Number, default: null },
      lng:      { type: Number, default: null },
    },

    area: {
      value: { type: Number, required: true },
      unit:  { type: String, enum: ['sqft', 'sqyd', 'acre'], default: 'sqft' },
    },

    frontRoadWidth: { type: String, default: '' },
    facing:         { type: String, default: '' },

    facilities: [{ type: String }], // e.g. ['bathroom', 'parking', 'lift']
    nearbyLandmarks: [{
      type:        { type: String },     // e.g. 'metro', 'bus_stand'
      distanceKm:  { type: Number },
    }],

    price:      { type: Number, required: true },
    negotiable: { type: Boolean, default: false },

    media: {
      images: [{ type: String }],
      video:  { type: String, default: null },
    },

    documents: {
      saleDeed:        { type: String, default: null },
      khataKhasra:     { type: String, default: null },
      registry:        { type: String, default: null },
      taxReceipt:      { type: String, default: null },
      ownershipProof:  { type: String, default: null },
      encumbranceCertificate: { type: String, default: null },
    },

    // No login required to submit — seller contact captured directly
    seller: {
      name:    { type: String, required: true, trim: true },
      mobile:  { type: String, required: true, trim: true },
      email:   { type: String, default: '', trim: true, lowercase: true },
    },

    ownership: {
      ownerName:             { type: String, default: '' },
      details:               { type: String, default: '' },
      previousOwnerName:     { type: String, default: '' },
      ownershipChain:        { type: String, default: '' }, // brief history: how it passed hand to hand
      possessionType:        { type: String, enum: ['freehold', 'leasehold', 'power_of_attorney', 'co_owned', ''], default: '' },
      numberOfPreviousOwners:{ type: Number, default: 0 },
      yearOfPurchase:        { type: Number, default: null },
      litigationFree:        { type: Boolean, default: true },
    },

    status:   { type: String, enum: ['pending', 'approved', 'rejected', 'sold', 'rented'], default: 'pending', index: true },
    featured: { type: Boolean, default: false },

    brokeragePercent: { type: Number, default: null },
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text', 'location.locality': 'text' });

export default mongoose.model('Property', propertySchema);
