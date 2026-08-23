const express = require('express');
const {
  getOrganizationSchema,
  getServiceSchema,
  getIndustrySchema,
  getCaseStudySchema,
  getBlogSchema,
  getReviewSchema,
} = require('../controllers/seoController');

const router = express.Router();

router.get('/organization', getOrganizationSchema);
router.get('/reviews', getReviewSchema);
router.get('/service/:slug', getServiceSchema);
router.get('/industry/:slug', getIndustrySchema);
router.get('/case-study/:slug', getCaseStudySchema);
router.get('/blog/:slug', getBlogSchema);

module.exports = router;