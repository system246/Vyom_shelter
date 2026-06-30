import { v2 as cloudinary } from 'cloudinary';

// Reads credentials from env at call time (not import time) — same reasoning
// as the mailer fix earlier: avoids a fixed-at-import-time config object
// getting built before dotenv.config() has actually run.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
