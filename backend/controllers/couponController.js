const Coupon = require('../models/Coupon');

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

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if active
    if (!coupon.active) {
      return res.status(400).json({ message: 'This coupon is inactive' });
    }

    // Check expiry
    if (new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    // Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (coupon.value / 100) * subtotal;
      if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) {
        discount = coupon.maxDiscountCap;
      }
    } else {
      discount = coupon.value;
    }

    // Discount should not exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    discount = Math.round(discount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      total: Math.round((subtotal - discount) * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/coupons/available?subtotal=xxx
exports.getAvailableCoupons = async (req, res) => {
  try {
    const subtotal = Number(req.query.subtotal) || 0;
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const result = coupons.map((c) => {
      const reasons = [];
      let eligible = true;

      if (!c.active) {
        eligible = false;
        reasons.push('Coupon is inactive');
      }

      if (new Date(c.expiry) < new Date()) {
        eligible = false;
        reasons.push('Coupon has expired');
      }

      if (c.usageLimit && c.usedCount >= c.usageLimit) {
        eligible = false;
        reasons.push('Usage limit reached');
      }

      if (subtotal < c.minOrderValue) {
        eligible = false;
        reasons.push(`Minimum order ₹${c.minOrderValue} required`);
      }

      // Calculate potential discount
      let discount = 0;
      if (eligible) {
        if (c.type === 'percentage') {
          discount = (c.value / 100) * subtotal;
          if (c.maxDiscountCap && discount > c.maxDiscountCap) {
            discount = c.maxDiscountCap;
          }
        } else {
          discount = c.value;
        }
        if (discount > subtotal) discount = subtotal;
        discount = Math.round(discount * 100) / 100;
      }

      return {
        _id: c._id,
        code: c.code,
        type: c.type,
        value: c.value,
        minOrderValue: c.minOrderValue,
        maxDiscountCap: c.maxDiscountCap,
        expiry: c.expiry,
        eligible,
        reasons,
        discount,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
