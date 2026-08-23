const express = require('express');
const { uploadMedia, getMediaAdmin, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');
const { handleMediaUpload } = require('../middleware/mediaUpload');

const router = express.Router();

router.get('/admin/list', protect, adminRateLimiter, getMediaAdmin);
router.post('/', protect, adminWriteRateLimiter, handleMediaUpload, uploadMedia);
router.delete('/:id', protect, adminWriteRateLimiter, deleteMedia);

module.exports = router;