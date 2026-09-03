const multer = require('multer');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, WebP, GIF, SVG, MP4, WebM, PDF, DOC, and DOCX files are allowed'));
    }

    if (file.mimetype.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      return callback(new Error('Image files must be 5MB or smaller'));
    }

    callback(null, true);
  },
});

const handleMediaUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message || 'Invalid media upload' });
    next();
  });
};

module.exports = { handleMediaUpload };
