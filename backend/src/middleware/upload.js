import multer from 'multer';
import CloudinaryStorage from '../utils/cloudinaryStorage.js';

// Files go straight to Cloudinary's CDN instead of the server's local disk.
// This fixes two real problems with local storage: (1) most free hosting
// platforms wipe the filesystem on every redeploy/restart, silently
// deleting every uploaded property photo/document, and (2) images were
// being served back through your own (possibly idle/cold-started) backend
// instead of a fast CDN edge network — which is what made them slow to load.
const storage = new CloudinaryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4', 'video/quicktime', 'video/webm'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP, PDF, MP4 allowed'));
};

const MAX = parseInt(process.env.MAX_FILE_SIZE_MB || '5');
const multerInstance = multer({ storage, fileFilter, limits: { fileSize: MAX * 1024 * 1024 } });

// For associate registration (aadhaar + pan + bank doc)
export const upload = multerInstance.fields([
  { name: 'aadhaarFile',   maxCount: 1 },
  { name: 'panFile',       maxCount: 1 },
  { name: 'bankDocument',  maxCount: 1 },
]);

// For profile photo upload
export const uploadPhoto = multerInstance.single('profilePhoto');

// For service logo/cover image (head_admin adds services)
export const uploadServiceImage = multerInstance.single('serviceImage');

// For property listing (seller upload: images, video, documents)
export const uploadProperty = multerInstance.fields([
  { name: 'images',         maxCount: 10 },
  { name: 'video',          maxCount: 1 },
  { name: 'saleDeed',       maxCount: 1 },
  { name: 'khataKhasra',    maxCount: 1 },
  { name: 'registry',       maxCount: 1 },
  { name: 'taxReceipt',     maxCount: 1 },
  { name: 'ownershipProof', maxCount: 1 },
  { name: 'encumbranceCertificate', maxCount: 1 },
]);
