const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    // Total revenue
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Totals
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Coupons used
    const couponResult = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usedCount' } } },
    ]);
    const totalCouponsUsed = couponResult[0]?.total || 0;

    // Last 7 days sales
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailySales.find((d) => d._id === dateStr);
      salesData.push({
        date: dateStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      });
    }

    res.json({
      totalRevenue,
      totalUsers,
      totalOrders,
      totalProducts,
      totalCouponsUsed,
      salesData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
