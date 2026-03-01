const express = require('express');
const router = express.Router();
const { getStats, getUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);

module.exports = router;
