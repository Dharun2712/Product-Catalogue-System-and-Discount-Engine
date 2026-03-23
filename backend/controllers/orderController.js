const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const {
  roundMoney,
  getCouponValidationResult,
  calculateCouponDiscount,
  calculateOrderTotal,
} = require('../services/pricingService');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Validate items and calculate subtotal server-side
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Item quantity must be a positive integer' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (!product.active) {
        return res.status(400).json({ message: `${product.name} is not available` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountPrice != null ? product.discountPrice : product.price;
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ message: `Invalid price configured for ${product.name}` });
      }

      subtotal = roundMoney(subtotal + Number(price) * quantity);

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
      });
    }

    // Apply coupon if provided (server-side validation)
    let discount = 0;
    let couponApplied = null;

    if (couponCode && couponCode.trim()) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });

      const validation = getCouponValidationResult(coupon, subtotal);
      if (!validation.valid) {
        if (validation.reason === 'minimum_order_not_met') {
          return res.status(400).json({
            message: `Minimum order value of ₹${validation.minimumOrderValue} required for this coupon`,
          });
        }

        const reasonToMessage = {
          not_found: 'Invalid coupon code',
          inactive: 'Coupon is inactive',
          expired: 'Coupon has expired',
          usage_limit_reached: 'Coupon usage limit reached',
        };

        return res.status(400).json({
          message: reasonToMessage[validation.reason] || 'Invalid coupon code',
        });
      }

      discount = calculateCouponDiscount(coupon, subtotal);
      couponApplied = coupon.code;

      // Increment usage count
      coupon.usedCount += 1;
      await coupon.save();
    }

    const total = calculateOrderTotal(subtotal, discount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      couponApplied,
      discount,
      total,
    });

    // Reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name images');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
