const express = require('express');
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialsAdmin,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

// Public endpoints
router.get('/', getTestimonials);

// Admin-only endpoints
router.get('/admin/list', protect, adminRateLimiter, getTestimonialsAdmin);
router.post('/', protect, adminWriteRateLimiter, createTestimonial);
router.put('/:id', protect, adminWriteRateLimiter, updateTestimonial);
router.delete('/:id', protect, adminWriteRateLimiter, deleteTestimonial);

module.exports = router;
