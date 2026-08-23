const express = require('express');
const { getSitemap, getRobots } = require('../controllers/technicalSeoController');

const router = express.Router();

router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobots);

module.exports = router;