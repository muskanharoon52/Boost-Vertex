const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');
const {
  getContactMessages,
  getContactMessageById,
  updateContactMessageReadState,
  deleteContactMessage,
} = require('../controllers/contactMessageController');

const router = express.Router();

router.get('/', protect, adminRateLimiter, getContactMessages);
router.get('/:id', protect, adminRateLimiter, getContactMessageById);
router.patch('/:id/read', protect, adminWriteRateLimiter, updateContactMessageReadState);
router.delete('/:id', protect, adminWriteRateLimiter, deleteContactMessage);

module.exports = router;
