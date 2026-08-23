const multer = require('multer');

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, WebP, GIF, MP4, and WebM files are allowed'));
    }

    if (file.mimetype.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      return callback(new Error('Image files must be 5MB or smaller'));
    }

    callback(null, true);
  },
});

const handleMediaUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message || 'Invalid media upload' });
    next();
  });
};

module.exports = { handleMediaUpload };