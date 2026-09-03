const express = require('express');
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  updateAdminAvatar,
  removeAdminAvatar,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { handleMediaUpload } = require('../middleware/mediaUpload');

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, handleMediaUpload, updateAdminAvatar);
router.delete('/avatar', protect, removeAdminAvatar);

module.exports = router;
