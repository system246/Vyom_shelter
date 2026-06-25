import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = path.join(UPLOAD_DIR, file.fieldname);
    if (!fs.existsSync(sub)) fs.mkdirSync(sub, { recursive: true });
    cb(null, sub);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

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
