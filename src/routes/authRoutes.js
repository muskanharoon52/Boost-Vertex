const express = require('express');
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protect, getAdminProfile);

module.exports = router;
