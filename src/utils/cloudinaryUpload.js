const { getCloudinary } = require('../config/cloudinary');

/**
 * Map an uploaded file's MIME type to a Cloudinary resource_type.
 *   video/*            -> 'video'
 *   image/* (incl svg) -> 'image'
 *   everything else    -> 'raw'  (PDF, DOC, DOCX, ...)
 */
const resolveResourceType = (mimetype = '') => {
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  return 'raw';
};

/**
 * Upload an in-memory file buffer to Cloudinary.
 *
 * - Images (except SVG) get automatic format/quality optimisation.
 * - SVGs are uploaded with the `sanitize` flag so any embedded scripts are
 *   stripped before storage/delivery (mitigates SVG XSS).
 * - PDF/DOC/DOCX are stored as `raw`.
 *
 * Resolves with `{ result, resourceType }`.
 */
const uploadBufferToCloudinary = (file, folder, extraOptions = {}) => new Promise((resolve, reject) => {
  const cloudinary = getCloudinary();
  const resourceType = resolveResourceType(file.mimetype);
  const isSvg = file.mimetype === 'image/svg+xml';

  const options = {
    folder: folder || 'boost-vertex',
    resource_type: resourceType,
    ...(resourceType === 'image' && !isSvg
      ? { transformation: [{ fetch_format: 'auto', quality: 'auto' }] }
      : {}),
    // Strip active content from SVGs on upload.
    ...(isSvg ? { flags: 'sanitize' } : {}),
    ...extraOptions,
  };

  const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    resolve({ result, resourceType });
  });
  stream.end(file.buffer);
});

module.exports = { uploadBufferToCloudinary, resolveResourceType };
