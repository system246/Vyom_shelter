import { z } from 'zod';

export const personalSchema = z.object({
  fullName:    z.string().min(2, 'Full name must be at least 2 characters'),
  sdwo:        z.string().min(2, 'This field is required'),
  dob:         z.string().min(1, 'Date of birth is required'),
  gender:      z.enum(['male', 'female', 'other'], { required_error: 'Select a gender' }),
  address:     z.string().min(10, 'Address must be at least 10 characters'),
  pincode:     z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  mobile:      z.string().regex(/^\d{10}$/, 'Mobile must be 10 digits'),
  whatsapp:    z.string().regex(/^\d{10}$/, 'WhatsApp must be 10 digits'),
  email:       z.string().email('Enter a valid email address'),
});

export const professionalSchema = z.object({
  profession:    z.string().min(2, 'Profession is required'),
  education:     z.string().min(1, 'Select education level'),
  nomineeName:   z.string().min(2, 'Nominee name is required'),
  nomineeRelation: z.string().min(1, 'Select relation'),
});

export const documentSchema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
  panNumber:     z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN format: ABCDE1234F'),
});

export const bankSchema = z.object({
  bankName:      z.string().min(2, 'Bank name is required'),
  branch:        z.string().min(2, 'Branch is required'),
  ifscCode:      z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0001234)'),
  accountNumber: z.string().regex(/^\d{9,18}$/, 'Account number must be 9–18 digits'),
});

export const referralSchema = z.object({
  associateRefNo:   z.string().min(1, 'Associate Ref No is required'),
  associateName:    z.string().min(2, 'Associate name is required'),
  newCandidateRefNo: z.string().min(1, 'New Candidate Referral No is required'),
  isDirect:         z.boolean().optional(),
});

export const declarationSchema = z.object({
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms & conditions' }) }),
});

export const listPropertySchema = z.object({
  listingType:  z.enum(['sale', 'rent']),
  propertyType: z.string().min(1, 'Select a property type'),
  title:        z.string().min(5, 'Title must be at least 5 characters'),
  description:  z.string().min(20, 'Description must be at least 20 characters'),
  location: z.object({
    state:    z.string().min(1, 'State is required'),
    district: z.string().min(1, 'District is required'),
    city:     z.string().min(1, 'City is required'),
    locality: z.string().min(1, 'Locality is required'),
    address:  z.string().min(5, 'Address is required'),
    pincode:  z.string().regex(/^\d{6}$/, 'Must be 6 digits'),
  }),
  area: z.object({
    value: z.string().min(1, 'Area is required'),
    unit:  z.enum(['sqft', 'sqyd', 'acre']),
  }),
  frontRoadWidth:  z.string().optional(),
  facing:          z.string().optional(),
  facilities:      z.array(z.string()),
  nearbyLandmarks: z.array(z.object({ type: z.string(), distanceKm: z.number() })),
  price:      z.string().min(1, 'Price is required'),
  negotiable: z.boolean(),
  seller: z.object({
    name:   z.string().min(2, 'Your name is required'),
    mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
    email:  z.string().refine(v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email'),
  }),
  ownership: z.object({
    ownerName:              z.string().optional(),
    details:                z.string().optional(),
    previousOwnerName:      z.string().optional(),
    ownershipChain:         z.string().optional(),
    possessionType:         z.string().optional(),
    numberOfPreviousOwners: z.string().optional(),
    yearOfPurchase:         z.string().optional(),
    litigationFree:         z.boolean(),
  }),
});
