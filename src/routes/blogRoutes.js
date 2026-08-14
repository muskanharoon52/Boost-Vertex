const express = require('express');
const {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsAdmin,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

// Public endpoints
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Admin-only endpoints
router.get('/admin/list', protect, adminRateLimiter, getBlogsAdmin);
router.post('/', protect, adminWriteRateLimiter, createBlog);
router.put('/:id', protect, adminWriteRateLimiter, updateBlog);
router.delete('/:id', protect, adminWriteRateLimiter, deleteBlog);

module.exports = router;
