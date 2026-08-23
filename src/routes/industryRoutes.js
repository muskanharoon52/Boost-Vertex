const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');
const { getIndustries, getIndustriesAdmin, getIndustryBySlug, createIndustry, updateIndustry, deleteIndustry } = require('../controllers/contentController');

const router = express.Router();

router.get('/', getIndustries);
router.get('/admin/list', protect, adminRateLimiter, getIndustriesAdmin);
router.get('/:slug', getIndustryBySlug);
router.post('/', protect, adminWriteRateLimiter, createIndustry);
router.put('/:id', protect, adminWriteRateLimiter, updateIndustry);
router.delete('/:id', protect, adminWriteRateLimiter, deleteIndustry);

module.exports = router;