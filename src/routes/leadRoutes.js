const express = require('express');
const {
  createLead,
  getLeads,
  getLeadById,
  exportLeads,
  updateLeadStatus,
  updateLeadReadState,
  updateLead,
  deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');

const router = express.Router();

router.post('/', createLead);
router.get('/export', protect, adminRateLimiter, exportLeads);
router.get('/', protect, adminRateLimiter, getLeads);
router.get('/:id', protect, adminRateLimiter, getLeadById);
router.patch('/:id/status', protect, adminWriteRateLimiter, updateLeadStatus);
router.patch('/:id/read', protect, adminWriteRateLimiter, updateLeadReadState);
router.patch('/:id', protect, adminWriteRateLimiter, updateLead);
router.delete('/:id', protect, adminWriteRateLimiter, deleteLead);

module.exports = router;
