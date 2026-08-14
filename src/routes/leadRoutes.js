const express = require('express');
const { createLead, getLeads, updateLeadStatus, updateLeadReadState } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

router.post('/', createLead);
router.get('/', protect, adminRateLimiter, getLeads);
router.patch('/:id/status', protect, adminWriteRateLimiter, updateLeadStatus);
router.patch('/:id/read', protect, adminWriteRateLimiter, updateLeadReadState);

module.exports = router;
