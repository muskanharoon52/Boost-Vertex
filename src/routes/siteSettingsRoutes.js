const express = require('express');
const { getSiteSettings, updateSiteSettings } = require('../controllers/siteSettingsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/', protect, updateSiteSettings);

module.exports = router;
