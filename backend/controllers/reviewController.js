const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Compute summary
    const total = reviews.length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating]++;
    });

    res.json({ reviews, total, avgRating: Number(avgRating), distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/reviews/:productId
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    // Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check for existing review
    const existing = await Review.findOne({
      user: req.user._id,
      product: req.params.productId,
    });

    if (existing) {
      // Update existing review
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      const populated = await existing.populate('user', 'name');
      return res.json(populated);
    }

    // Create new review
    const review = await Review.create({
      user: req.user._id,
      product: req.params.productId,
      rating,
      comment,
    });

    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/reviews/:id (admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/analytics/summary (admin)
exports.getReviewAnalytics = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();

    const avgResult = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    const averageRating = avgResult[0]?.avg
      ? Number(avgResult[0].avg.toFixed(1))
      : 0;

    // Rating distribution
    const distResult = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: distResult.find((d) => d._id === star)?.count || 0,
    }));

    // Top rated products (by avg rating, min 1 review)
    const topProducts = await Review.aggregate([
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          avgRating: { $round: ['$avgRating', 1] },
          reviewCount: 1,
        },
      },
    ]);

    res.json({
      totalReviews,
      averageRating,
      ratingDistribution,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/admin/all (admin) — all reviews with filters
exports.getAllReviews = async (req, res) => {
  try {
    const { rating, sort = 'newest' } = req.query;
    const query = {};
    if (rating) query.rating = Number(rating);

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : sort === 'highest' ? { rating: -1 } : sort === 'lowest' ? { rating: 1 } : { createdAt: -1 };

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name category')
      .sort(sortOption);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
