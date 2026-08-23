const express = require('express');
const { getPublicComments, createComment, getCommentsAdmin, updateCommentStatus, deleteComment } = require('../controllers/blogCommentController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

router.get('/admin/list', protect, adminRateLimiter, getCommentsAdmin);
router.patch('/:id/status', protect, adminWriteRateLimiter, updateCommentStatus);
router.delete('/:id', protect, adminWriteRateLimiter, deleteComment);
router.get('/:blogId', getPublicComments);
router.post('/:blogId', createComment);

module.exports = router;