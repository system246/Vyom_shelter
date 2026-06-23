import mongoose from 'mongoose';

const associateSchema = new mongoose.Schema(
  {
    associateId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    personal: {
      fullName:  { type: String, required: true, trim: true },
      sdwo:      { type: String, required: true, trim: true },
      dob:       { type: String, required: true },
      gender:    { type: String, enum: ['male', 'female', 'other'], required: true },
      address:   { type: String, required: true, trim: true },
      pincode:   { type: String, required: true },
      mobile:    { type: String, required: true },
      whatsapp:  { type: String, required: true },
      email:     { type: String, required: true, lowercase: true, trim: true },
    },

    professional: {
      profession:      { type: String, required: true },
      education:       { type: String, required: true },
      nomineeName:     { type: String, required: true },
      nomineeRelation: { type: String, required: true },
    },

    documents: {
      aadhaarNumber: { type: String, required: true },
      panNumber:     { type: String, required: true },
      aadhaarFile:   { type: String },
      panFile:       { type: String },
      bankDocument:  { type: String }, // passbook/cheque
    },

    bank: {
      bankName:      { type: String, required: true },
      branch:        { type: String, required: true },
      ifscCode:      { type: String, required: true },
      accountNumber: { type: String, required: true },
    },

    referral: {
      associateRefNo:    { type: String, required: true },
      associateName:     { type: String, required: true },
      // Generated only when head_admin approves this record — null until then,
      // so a rejected applicant never holds a working referral code.
      newCandidateRefNo: { type: String, default: null },
      isDirect:          { type: Boolean, default: false }, // true = no referrer, registered under Head Office
    },

    declaration: {
      acceptTerms: { type: Boolean, required: true },
      submittedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Associate', associateSchema);
