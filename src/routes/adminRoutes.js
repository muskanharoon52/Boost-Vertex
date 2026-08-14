const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getDashboardSummary, getAnalytics } = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', protect, getDashboardSummary);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
