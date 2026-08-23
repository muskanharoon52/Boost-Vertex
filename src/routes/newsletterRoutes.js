const express = require('express');
const { subscribe, unsubscribe, getSubscriptionsAdmin } = require('../controllers/newsletterController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/admin/list', protect, adminRateLimiter, getSubscriptionsAdmin);

module.exports = router;