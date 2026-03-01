import { useState, useEffect } from 'react';
import API from '../../api/axios';

import toast from 'react-hot-toast';
import { HiTrash, HiStar, HiFilter } from 'react-icons/hi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filterRating, sortBy]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/reviews/analytics/summary');
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRating) params.append('rating', filterRating);
      params.append('sort', sortBy);
      const { data } = await API.get(`/reviews/admin/all?${params}`);
      setReviews(data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews();
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const StarDisplay = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <HiStar
          key={s}
          className={`${size} ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );

  return (
    <div>
        {/* Analytics Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600">
                  <HiStar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Reviews</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.totalReviews}</p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                  <HiStar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-900">{analytics.averageRating}</p>
                    <StarDisplay rating={Math.round(analytics.averageRating)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <HiStar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Top Products</p>
                  <p className="text-xl font-bold text-gray-900">{analytics.topProducts?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        {analytics && analytics.totalReviews > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Rating Distribution */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} stroke="#9ca3af" />
                  <YAxis
                    type="category"
                    dataKey="star"
                    tickFormatter={(v) => `${v}★`}
                    fontSize={12}
                    stroke="#9ca3af"
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Reviews']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#facc15" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Rated Products */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Rated Products</h3>
              {analytics.topProducts?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topProducts.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">
                          {p.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <HiStar className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{p.avgRating}</span>
                        </div>
                        <span className="text-xs text-gray-400">({p.reviewCount})</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No product reviews yet</p>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiFilter className="w-4 h-4" />
            <span className="font-medium">Filter:</span>
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="input-field w-auto text-sm py-2"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto text-sm py-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No reviews yet</h3>
            <p className="text-sm text-gray-400">
              Reviews submitted by users will appear here.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3.5 font-medium text-gray-500">User</th>
                    <th className="px-6 py-3.5 font-medium text-gray-500">Product</th>
                    <th className="px-6 py-3.5 font-medium text-gray-500">Rating</th>
                    <th className="px-6 py-3.5 font-medium text-gray-500">Comment</th>
                    <th className="px-6 py-3.5 font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3.5 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{review.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400">{review.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{review.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-400">{review.product?.category || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <StarDisplay rating={review.rating} />
                          <span className="text-xs font-medium text-gray-600">{review.rating}/5</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 line-clamp-2 max-w-[300px]">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete review"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
