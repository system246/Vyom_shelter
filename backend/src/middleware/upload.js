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
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP, PDF allowed'));
};

const MAX = parseInt(process.env.MAX_FILE_SIZE_MB || '5');

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX * 1024 * 1024 } })
  .fields([{ name: 'aadhaarFile', maxCount: 1 }, { name: 'panFile', maxCount: 1 }]);
