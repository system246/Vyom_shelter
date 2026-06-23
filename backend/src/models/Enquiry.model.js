import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    enquiryId: { type: String, required: true, unique: true, index: true },
    property:  { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    type:      { type: String, enum: ['interest', 'site_visit', 'contact'], default: 'interest' },

    name:   { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email:  { type: String, default: '', trim: true, lowercase: true },
    message:{ type: String, default: '' },

    preferredVisitDate: { type: String, default: '' },

    status: { type: String, enum: ['new', 'contacted', 'site_visit_scheduled', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
