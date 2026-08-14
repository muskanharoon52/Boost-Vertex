const express = require('express');
const {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServicesAdmin,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

// Public endpoints
router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

// Admin-only endpoints
router.get('/admin/list', protect, adminRateLimiter, getServicesAdmin);
router.post('/', protect, adminWriteRateLimiter, createService);
router.put('/:id', protect, adminWriteRateLimiter, updateService);
router.delete('/:id', protect, adminWriteRateLimiter, deleteService);

module.exports = router;
