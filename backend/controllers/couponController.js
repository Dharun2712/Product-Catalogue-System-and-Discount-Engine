const Coupon = require('../models/Coupon');
const {
  assertValidSubtotal,
  getCouponValidationResult,
  calculateCouponDiscount,
  calculateOrderTotal,
} = require('../services/pricingService');

// GET /api/coupons
exports.getCoupons = async (req, res) => {
  try {
    let coupons;
    if (req.user && req.user.role === 'admin') {
      coupons = await Coupon.find().sort({ createdAt: -1 });
    } else {
      // For users - return all coupons with eligibility info
      coupons = await Coupon.find().sort({ createdAt: -1 });
    }
    res.json(coupons);
  } catch (error) {
    if (error.message === 'Subtotal must be a non-negative number') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// POST /api/coupons (admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxDiscountCap, usageLimit, expiry, active } = req.body;

    if (!code || !type || value == null || !expiry) {
      return res.status(400).json({ message: 'Code, type, value, and expiry are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minOrderValue: minOrderValue || 0,
      maxDiscountCap: type === 'percentage' ? maxDiscountCap : null,
      usageLimit: usageLimit || null,
      expiry,
      active: active !== undefined ? active : true,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/coupons/:id (admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const fields = ['code', 'type', 'value', 'minOrderValue', 'maxDiscountCap', 'usageLimit', 'expiry', 'active'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    if (req.body.code) coupon.code = req.body.code.toUpperCase();

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/coupons/:id (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal == null) {
      return res.status(400).json({ message: 'Coupon code and subtotal are required' });
    }

    const numericSubtotal = assertValidSubtotal(subtotal);
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    const validation = getCouponValidationResult(coupon, numericSubtotal);
    if (!validation.valid) {
      if (validation.reason === 'not_found') {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      if (validation.reason === 'minimum_order_not_met') {
        return res.status(400).json({
          message: `Minimum order value of ₹${validation.minimumOrderValue} required`,
        });
      }

      const reasonToMessage = {
        inactive: 'This coupon is inactive',
        expired: 'This coupon has expired',
        usage_limit_reached: 'This coupon has reached its usage limit',
      };

      return res.status(400).json({
        message: reasonToMessage[validation.reason] || 'This coupon is invalid',
      });
    }

    const discount = calculateCouponDiscount(coupon, numericSubtotal);

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      total: calculateOrderTotal(numericSubtotal, discount),
    });
  } catch (error) {
    if (error.message === 'Subtotal must be a non-negative number') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/coupons/available?subtotal=xxx
exports.getAvailableCoupons = async (req, res) => {
  try {
    const subtotal = assertValidSubtotal(Number(req.query.subtotal) || 0);
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const result = coupons.map((c) => {
      const reasons = [];
      const validation = getCouponValidationResult(c, subtotal);
      let discount = 0;

      if (!validation.valid) {
        const reasonToMessage = {
          inactive: 'Coupon is inactive',
          expired: 'Coupon has expired',
          usage_limit_reached: 'Usage limit reached',
          minimum_order_not_met: `Minimum order ₹${validation.minimumOrderValue} required`,
        };

        reasons.push(reasonToMessage[validation.reason] || 'Coupon is invalid');
      } else {
        discount = calculateCouponDiscount(c, subtotal);
      }

      return {
        _id: c._id,
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscountCap: c.maxDiscountCap,
        expiry: c.expiry,
        eligible: validation.valid,
        reasons,
        discount,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
