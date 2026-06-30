import cloudinary from './cloudinary.js';

/**
 * A minimal multer storage engine that uploads directly to Cloudinary v2.
 *
 * Why not the 'multer-storage-cloudinary' npm package: it's unmaintained
 * and its peer dependency is locked to Cloudinary v1 — installing it
 * alongside the current v2 SDK (which we want, for the up-to-date API and
 * security fixes) causes an npm dependency-resolution conflict. This is
 * ~30 lines doing the same job directly against the official SDK, with no
 * extra dependency or version-lock risk.
 */
export default class CloudinaryStorage {
  constructor({ folderPrefix = 'vyom-shelter' } = {}) {
    this.folderPrefix = folderPrefix;
  }

  _handleFile(req, file, cb) {
    const isVideo = file.mimetype.startsWith('video/');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${this.folderPrefix}/${file.fieldname}`,
        resource_type: isVideo ? 'video' : 'auto',
      },
      (err, result) => {
        if (err) return cb(err);
        // Mirrors the shape multer normally produces (file.path, file.filename)
        // so the rest of the codebase (which reads req.files[...].path) needs
        // no changes regardless of which storage engine is plugged in.
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );
    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    // Best-effort cleanup if a later step in the same request fails after
    // this file already uploaded (e.g. validation error on a sibling field).
    if (!file.filename) return cb(null);
    cloudinary.uploader.destroy(file.filename, () => cb(null));
  }
}
