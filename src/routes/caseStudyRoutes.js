const express = require('express');
const {
  getCaseStudies,
  getCaseStudyBySlug,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getCaseStudiesAdmin,
} = require('../controllers/caseStudyController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

// Public endpoints
router.get('/', getCaseStudies);
router.get('/:slug', getCaseStudyBySlug);

// Admin-only endpoints
router.get('/admin/list', protect, adminRateLimiter, getCaseStudiesAdmin);
router.post('/', protect, adminWriteRateLimiter, createCaseStudy);
router.put('/:id', protect, adminWriteRateLimiter, updateCaseStudy);
router.delete('/:id', protect, adminWriteRateLimiter, deleteCaseStudy);

module.exports = router;
