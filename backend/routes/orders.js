const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/admin', protect, admin, getAllOrders);

module.exports = router;
