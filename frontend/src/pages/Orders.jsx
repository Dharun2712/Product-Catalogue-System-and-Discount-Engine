import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  HiClock,
  HiCurrencyRupee,
  HiTicket,
  HiShoppingBag,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/user');
      setOrders(data);
      // Auto-expand the first order
      if (data.length > 0) setExpandedOrder(data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (id) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-100 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded-lg w-40" />
        </div>
        <LoadingSkeleton count={3} type="table" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <HiShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-400">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-5xl">📦</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Looks like you haven't placed any orders. Browse our collection and find something you love!
          </p>
          <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
            <HiShoppingBag className="w-5 h-5" />
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, index) => {
            const isExpanded = expandedOrder === order._id;
            return (
              <div
                key={order._id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Order Header - Clickable */}
                <button
                  onClick={() => toggleOrder(order._id)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Order Number Badge */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl flex items-center justify-center border border-primary-100">
                      <span className="text-lg font-bold text-primary-600">
                        {orders.length - index}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        {order.couponApplied && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <HiTicket className="w-3 h-3" />
                            {order.couponApplied}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <HiClock className="w-3.5 h-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="text-gray-200">·</span>
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 flex items-center justify-end gap-0.5">
                        <HiCurrencyRupee className="w-5 h-5 text-gray-600" />
                        {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      {order.couponApplied && order.discount > 0 && (
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          Saved ₹{order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-primary-50 text-primary-600 rotate-0' : 'bg-gray-50 text-gray-400'}`}>
                      {isExpanded ? (
                        <HiChevronUp className="w-5 h-5" />
                      ) : (
                        <HiChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expandable Items Section */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      {/* Items Label */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Items ({order.items.length})
                        </p>
                      </div>

                      {/* Item List */}
                      <div className="space-y-2.5">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary-500">
                                  {item.quantity}x
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-4">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Price Breakdown */}
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1.5">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {order.couponApplied && order.discount > 0 && (
                          <div className="flex items-center justify-between text-sm text-emerald-600">
                            <span className="flex items-center gap-1">
                              <HiTicket className="w-3.5 h-3.5" />
                              Discount ({order.couponApplied})
                            </span>
                            <span>-₹{order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-base font-bold text-gray-900 pt-1.5">
                          <span>Total</span>
                          <span className="flex items-center gap-0.5">
                            <HiCurrencyRupee className="w-4 h-4" />
                            {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
