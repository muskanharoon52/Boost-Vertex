const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminRateLimiter, adminWriteRateLimiter } = require('../middleware/adminRateLimiter');
const { getClients, getClientsAdmin, getClientBySlug, createClient, updateClient, deleteClient } = require('../controllers/contentController');

const router = express.Router();

router.get('/', getClients);
router.get('/admin/list', protect, adminRateLimiter, getClientsAdmin);
router.get('/:slug', getClientBySlug);
router.post('/', protect, adminWriteRateLimiter, createClient);
router.put('/:id', protect, adminWriteRateLimiter, updateClient);
router.delete('/:id', protect, adminWriteRateLimiter, deleteClient);

module.exports = router;