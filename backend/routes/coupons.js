const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getAvailableCoupons,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.get('/available', protect, getAvailableCoupons);
router.post('/validate', protect, validateCoupon);
router.get('/', protect, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
