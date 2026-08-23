const express = require('express');
const { getLegalDocument, getLegalDocumentsAdmin, upsertLegalDocument } = require('../controllers/legalController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

router.get('/admin/list', protect, adminRateLimiter, getLegalDocumentsAdmin);
router.put('/:type', protect, adminWriteRateLimiter, upsertLegalDocument);
router.get('/:type', getLegalDocument);

module.exports = router;