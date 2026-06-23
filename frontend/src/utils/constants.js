export const STEPS = [
  { id: 1, label: 'Personal',      short: 'Personal'      },
  { id: 2, label: 'Professional',  short: 'Professional'  },
  { id: 3, label: 'Documents',     short: 'Docs'          },
  { id: 4, label: 'Bank Details',  short: 'Bank'          },
  { id: 5, label: 'Referral',      short: 'Referral'      },
  { id: 6, label: 'Declaration',   short: 'Declare'       },
  { id: 7, label: 'Review',        short: 'Review'        },
];

export const EDUCATION_OPTIONS = [
  { value: '', label: 'Select Education' },
  { value: 'below_10th', label: 'Below 10th' },
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'post_graduate', label: 'Post Graduate' },
  { value: 'phd', label: 'PhD' },
];

export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male'   },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other'  },
];

export const RELATION_OPTIONS = [
  { value: '', label: 'Select Relation' },
  { value: 'spouse',  label: 'Spouse'  },
  { value: 'father',  label: 'Father'  },
  { value: 'mother',  label: 'Mother'  },
  { value: 'son',     label: 'Son'     },
  { value: 'daughter',label: 'Daughter'},
  { value: 'sibling', label: 'Sibling' },
  { value: 'other',   label: 'Other'   },
];

export const DRAFT_KEY = 'associate_draft';

// Used when a new associate has no referrer — registers directly under Vyom Shelter
export const HEAD_REFERRAL_CODE = 'VYOM-HEAD-0000';
export const HEAD_REFERRAL_NAME = 'Vyom Shelter Pvt. Ltd. (Head Office / Direct)';

// ---------- Property Portal Constants ----------
export const PROPERTY_TYPES = [
  { value: '', label: 'Select Property Type' },
  { value: 'plot', label: 'Plot' },
  { value: 'residential_house', label: 'Residential House' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'commercial_shop', label: 'Commercial Shop' },
  { value: 'agricultural_land', label: 'Agricultural Land' },
  { value: 'farm_house', label: 'Farm House' },
];

export const PROPERTY_TYPE_LABELS = PROPERTY_TYPES.reduce((acc, t) => {
  if (t.value) acc[t.value] = t.label;
  return acc;
}, {});

export const AREA_UNITS = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'sqyd', label: 'Sq. Yard' },
  { value: 'acre', label: 'Acre' },
];

export const FACING_OPTIONS = [
  { value: '', label: 'Select Facing' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north_east', label: 'North-East' },
  { value: 'north_west', label: 'North-West' },
  { value: 'south_east', label: 'South-East' },
  { value: 'south_west', label: 'South-West' },
];

export const LISTING_TYPES = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
];

export const PROPERTY_STATUS_LABELS = {
  pending: 'Pending Verification',
  approved: 'Verified',
  rejected: 'Rejected',
  sold: 'Sold',
  rented: 'Rented',
};

export const POSSESSION_TYPES = [
  { value: '', label: 'Select Possession Type' },
  { value: 'freehold', label: 'Freehold (fully owned)' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
  { value: 'co_owned', label: 'Co-owned / Joint Ownership' },
];

// Facilities — icon name maps to a lucide-react icon in FacilityIcon.jsx
export const FACILITIES = [
  { value: 'bathroom', label: 'Bathroom', icon: 'Bath' },
  { value: 'kitchen', label: 'Modular Kitchen', icon: 'ChefHat' },
  { value: 'parking', label: 'Car Parking', icon: 'Car' },
  { value: 'lift', label: 'Lift', icon: 'ArrowUpDown' },
  { value: 'power_backup', label: 'Power Backup', icon: 'Zap' },
  { value: 'water_supply', label: '24x7 Water Supply', icon: 'Droplets' },
  { value: 'security', label: 'Security Guard', icon: 'ShieldCheck' },
  { value: 'cctv', label: 'CCTV', icon: 'Camera' },
  { value: 'garden', label: 'Garden', icon: 'Trees' },
  { value: 'gym', label: 'Gym', icon: 'Dumbbell' },
  { value: 'swimming_pool', label: 'Swimming Pool', icon: 'Waves' },
  { value: 'club_house', label: 'Club House', icon: 'PartyPopper' },
  { value: 'play_area', label: "Children's Play Area", icon: 'Baby' },
  { value: 'gas_pipeline', label: 'Piped Gas', icon: 'Flame' },
  { value: 'internet', label: 'Internet / Wi-Fi', icon: 'Wifi' },
  { value: 'furnished', label: 'Furnished', icon: 'Sofa' },
  { value: 'balcony', label: 'Balcony', icon: 'PanelTop' },
  { value: 'wheelchair', label: 'Wheelchair Friendly', icon: 'Accessibility' },
];

// Nearby landmark types — icon name maps in FacilityIcon.jsx
export const LANDMARK_TYPES = [
  { value: 'metro', label: 'Metro Station', icon: 'TrainFront' },
  { value: 'bus_stand', label: 'Bus Stand', icon: 'Bus' },
  { value: 'railway_station', label: 'Railway Station', icon: 'TrainTrack' },
  { value: 'airport', label: 'Airport', icon: 'Plane' },
  { value: 'school', label: 'School', icon: 'GraduationCap' },
  { value: 'hospital', label: 'Hospital', icon: 'Stethoscope' },
  { value: 'market', label: 'Market', icon: 'ShoppingBag' },
  { value: 'mall', label: 'Shopping Mall', icon: 'ShoppingCart' },
  { value: 'highway', label: 'Highway', icon: 'Route' },
  { value: 'bank', label: 'Bank / ATM', icon: 'Landmark' },
  { value: 'park', label: 'Park', icon: 'Trees' },
  { value: 'temple', label: 'Temple / Worship Place', icon: 'Church' },
];
