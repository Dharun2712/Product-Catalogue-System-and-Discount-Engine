import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  HiShoppingCart,
  HiMinus,
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiStar,
  HiTrash,
} from 'react-icons/hi';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();
  const { isAdmin, user } = useAuth();
  const { formatPrice } = useCurrency();

  // Tabs
  const [activeTab, setActiveTab] = useState('description');

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ total: 0, avgRating: 0, distribution: {} });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await API.get(`/reviews/${id}`);
      setReviews(data.reviews);
      setReviewSummary({
        total: data.total,
        avgRating: data.avgRating,
        distribution: data.distribution,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    setSubmittingReview(true);
    try {
      await API.post(`/reviews/${id}`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const StarRating = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HiStar
          key={star}
          className={`${size} ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );

  const StarSelector = ({ rating, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <HiStar
            className={`w-7 h-7 transition ${
              star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 skeleton rounded w-1/4" />
            <div className="h-8 skeleton rounded w-3/4" />
            <div className="h-20 skeleton rounded" />
            <div className="h-10 skeleton rounded w-1/3" />
            <div className="h-12 skeleton rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const images = product.images?.length > 0 ? product.images : [];
  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'reviews', label: `Reviews (${reviewSummary.total})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                    >
                      <HiChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((p) => (p === images.length - 1 ? 0 : p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-white transition"
                    >
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-gray-300 text-9xl font-light">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                    i === currentImage ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <p className="text-sm text-primary-600 font-medium uppercase tracking-wide mb-2">
            {product.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Average Rating */}
          {reviewSummary.total > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(reviewSummary.avgRating)} />
              <span className="text-sm font-medium text-gray-600">
                {reviewSummary.avgRating} ({reviewSummary.total} {reviewSummary.total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="text-sm bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Stock:</span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
          </div>

          {product.stock > 0 && !isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-100 transition rounded-l-lg"
                  >
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-5 py-2 font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-gray-100 transition rounded-r-lg"
                  >
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                className="btn-primary flex items-center gap-2 text-lg py-3 px-8"
              >
                <HiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-2">
              <HiEye className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Admin Preview Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Description | Specifications | Reviews */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <div className="flex gap-0 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'specifications' && (
            <div>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-3 font-medium text-gray-700 w-1/3">{spec.key}</td>
                          <td className="px-6 py-3 text-gray-600">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No specifications available for this product.</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Review Summary */}
              {reviewSummary.total > 0 && (
                <div className="flex flex-col sm:flex-row gap-8 p-6 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{reviewSummary.avgRating}</div>
                    <StarRating rating={Math.round(reviewSummary.avgRating)} size="w-5 h-5" />
                    <p className="text-sm text-gray-500 mt-1">{reviewSummary.total} {reviewSummary.total === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewSummary.distribution[star] || 0;
                      const pct = reviewSummary.total > 0 ? (count / reviewSummary.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-3 text-gray-600">{star}</span>
                          <HiStar className="w-4 h-4 text-yellow-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-yellow-400 h-2.5 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-500">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Write Review Form (users only) */}
              {!isAdmin && user && (
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                      <StarSelector
                        rating={reviewForm.rating}
                        onChange={(r) => setReviewForm((prev) => ({ ...prev, rating: r }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                        className="input-field h-28 resize-none"
                        placeholder="Share your experience with this product..."
                        required
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 mt-1">{reviewForm.comment.length}/500</p>
                    </div>
                    <button type="submit" className="btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              {!isAdmin && !user && (
                <div className="border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-gray-500">Please <a href="/login" className="text-primary-600 font-medium hover:underline">login</a> to write a review.</p>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {review.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{review.user?.name || 'User'}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-gray-300 hover:text-red-500 transition"
                            title="Delete review"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
