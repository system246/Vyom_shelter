import { z } from 'zod';

/**
 * SINGLE SOURCE OF TRUTH for backend field validation.
 *
 * This is the layer that actually can't be bypassed — unlike the frontend's
 * zod schemas (frontend/src/utils/validations.js), which are UX-only and a
 * motivated user can skip entirely by calling the API directly. Every rule
 * that matters for data integrity or security must live here, not just on
 * the frontend.
 *
 * The patterns below intentionally match the frontend's validations.js
 * (same regex, same rules) so a user never sees the frontend accept
 * something the backend then rejects. If you change a rule (e.g. mobile
 * number format), change it here AND in frontend/src/utils/validations.js —
 * those two files can't literally share one file across separate Vercel/
 * Render deployments, but they should always be edited together.
 */

// ---------- Reusable field-level pieces ----------
const mobile   = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
const email    = z.string().email('Enter a valid email address');
const password = z.string().min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/\d/, 'Password must contain a number');
const otp      = z.string().regex(/^\d{4,8}$/, 'Enter a valid OTP');
const pincode  = z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits');
const aadhaar  = z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits');
const pan      = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN format: ABCDE1234F');
const ifsc     = z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code');

// ---------- Auth ----------
export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email,
  password,
  mobile: z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email,
  otp,
});

export const resendOtpSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  email,
  otp,
  password,
});

// ---------- Property ----------
export const propertyLocationSchema = z.object({
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  address: z.string().min(5, 'Address is required'),
  pincode,
});

export const propertyAreaSchema = z.object({
  value: z.coerce.number().positive('Area must be greater than 0'),
  unit: z.enum(['sqft', 'sqyd', 'acre']),
});

export const propertySellerSchema = z.object({
  name: z.string().min(2, 'Your name is required'),
  mobile,
  email: z.string().email().optional().or(z.literal('')),
});

// Submitted as multipart/form-data with JSON-stringified nested fields —
// the controller parses those strings before this schema runs against them.
export const submitPropertySchema = z.object({
  listingType: z.enum(['sale', 'rent']),
  propertyType: z.enum(['plot', 'residential_house', 'flat', 'commercial_shop', 'agricultural_land', 'farm_house']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  location: propertyLocationSchema,
  area: propertyAreaSchema,
  frontRoadWidth: z.string().optional(),
  facing: z.string().optional(),
  facilities: z.array(z.string()).optional().default([]),
  nearbyLandmarks: z.array(z.object({ type: z.string(), distanceKm: z.coerce.number() })).optional().default([]),
  price: z.coerce.number().positive('Price must be greater than 0'),
  negotiable: z.coerce.boolean().optional().default(false),
  seller: propertySellerSchema,
  ownership: z.object({}).passthrough().optional().default({}),
});

export const submitEnquirySchema = z.object({
  type: z.enum(['interest', 'site_visit', 'contact']).optional().default('interest'),
  name: z.string().min(2, 'Name is required'),
  mobile,
  email: z.string().email().optional().or(z.literal('')),
  message: z.string().max(1000).optional().default(''),
  preferredVisitDate: z.string().optional().default(''),
});

export const updatePropertyStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'sold', 'rented']).optional(),
  rejectionReason: z.string().optional(),
  brokeragePercent: z.coerce.number().min(0).max(100).optional(),
  featured: z.coerce.boolean().optional(),
  isExclusive: z.coerce.boolean().optional(),
});

// ---------- Services ----------
export const addServiceSchema = z.object({
  title: z.string().min(2, 'Title is required').max(150),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  tags: z.string().optional(), // JSON-stringified array, parsed in controller
  providerName: z.string().min(2, 'Provider name is required'),
  providerPhone: mobile,
  providerDetails: z.string().optional().default(''),
});

// ---------- Users / Associates (admin actions) ----------
export const createUserSchema = z.object({
  email,
  password,
  role: z.enum(['admin', 'associate']),
  profile: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    mobile: z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal('')),
  }),
});

export const associatePersonalSchema = z.object({
  fullName: z.string().min(2),
  sdwo: z.string().min(2),
  dob: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(10),
  pincode,
  mobile,
  whatsapp: mobile,
  email,
});

export const associateProfessionalSchema = z.object({
  profession: z.string().min(2),
  education: z.string().min(1),
  nomineeName: z.string().min(2),
  nomineeRelation: z.string().min(1),
});

export const associateDocumentSchema = z.object({
  aadhaarNumber: aadhaar,
  panNumber: pan,
});

export const associateBankSchema = z.object({
  bankName: z.string().min(2),
  branch: z.string().optional().default(''), // auto-filled from IFSC lookup on the frontend, may be empty if lookup failed
  ifscCode: ifsc,
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9–18 digits'),
});

export const associateReferralSchema = z.object({
  associateRefNo: z.string().min(1),
  associateName: z.string().min(2),
  newCandidateRefNo: z.string().optional(),
  isDirect: z.coerce.boolean().optional().default(false),
});
