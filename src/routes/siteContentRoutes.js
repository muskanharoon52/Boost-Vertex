const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getHomepageContent, updateHomepageContent, getAboutContent, updateAboutContent } = require('../controllers/contentController');

const router = express.Router();

router.get('/homepage', getHomepageContent);
router.put('/homepage', protect, updateHomepageContent);
router.get('/about', getAboutContent);
router.put('/about', protect, updateAboutContent);

module.exports = router;