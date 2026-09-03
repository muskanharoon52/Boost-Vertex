const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardSummary,
  getAnalytics,
  getNotificationSettings,
  updateNotificationSettings,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', protect, getDashboardSummary);
router.get('/analytics', protect, getAnalytics);
router.get('/notification-settings', protect, getNotificationSettings);
router.put('/notification-settings', protect, updateNotificationSettings);

module.exports = router;
