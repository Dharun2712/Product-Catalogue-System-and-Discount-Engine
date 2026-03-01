const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

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
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (!product.active) {
        return res.status(400).json({ message: `${product.name} is not available` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = product.discountPrice != null ? product.discountPrice : product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // Apply coupon if provided (server-side validation)
    let discount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }
      if (!coupon.active) {
        return res.status(400).json({ message: 'Coupon is inactive' });
      }
      if (new Date(coupon.expiry) < new Date()) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }
      if (subtotal < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        });
      }

      if (coupon.type === 'percentage') {
        discount = (coupon.value / 100) * subtotal;
        if (coupon.maxDiscountCap && discount > coupon.maxDiscountCap) {
          discount = coupon.maxDiscountCap;
        }
      } else {
        discount = coupon.value;
      }

      if (discount > subtotal) discount = subtotal;
      discount = Math.round(discount * 100) / 100;
      couponApplied = coupon.code;

      // Increment usage count
      coupon.usedCount += 1;
      await coupon.save();
    }

    const total = Math.round((subtotal - discount) * 100) / 100;

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
