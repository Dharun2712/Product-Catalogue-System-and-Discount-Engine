import { useState, useEffect } from 'react';
import API from '../../api/axios';

import {
  HiClock,
  HiUser,
  HiTicket,
  HiCurrencyRupee,
  HiShoppingBag,
  HiChevronDown,
  HiChevronUp,
  HiSearch,
} from 'react-icons/hi';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/admin');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (id) => setExpandedOrder((prev) => (prev === id ? null : id));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Extract just the product name (before first comma for long Amazon-style names)
  const getShortName = (name) => {
    if (!name) return 'Unknown Product';
    const parts = name.split(',');
    // If title is short, return full; otherwise return text before first comma
    return parts[0].length > 50 ? parts[0].substring(0, 50) + '…' : parts[0];
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      (order.user?.name || '').toLowerCase().includes(q) ||
      (order.user?.email || '').toLowerCase().includes(q) ||
      order.items.some((item) => (item.name || '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 text-white shadow-lg shadow-primary-200">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-bold mt-1">{orders.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Revenue</p>
            <p className="text-2xl font-bold mt-1">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Avg. Order</p>
            <p className="text-2xl font-bold mt-1">₹{(totalRevenue / orders.length).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-200">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Discounts Given</p>
            <p className="text-2xl font-bold mt-1">₹{totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!loading && orders.length > 0 && (
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer name, email, or product..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
          />
          {searchTerm && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 skeleton rounded" />
                  <div className="h-4 w-48 skeleton rounded" />
                  <div className="h-3 w-32 skeleton rounded" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-24 skeleton rounded ml-auto" />
                  <div className="h-6 w-28 skeleton rounded ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-gray-400 text-sm">Orders will appear here once customers start shopping</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-600">No matching orders</h3>
          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, index) => {
            const isExpanded = expandedOrder === order._id;
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleOrder(order._id)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50/40 transition-colors"
                >
                  {/* Left: Order Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-primary-100 to-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700">
                        {(order.user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Order ID + Badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-md">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                        {order.couponApplied && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            <HiTicket className="w-3 h-3" />
                            {order.couponApplied}
                          </span>
                        )}
                      </div>

                      {/* Customer Name */}
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {order.user?.name || 'Deleted User'}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <HiClock className="w-3 h-3" />
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="text-gray-200">·</span>
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price + Expand */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      {order.couponApplied && order.discount > 0 && (
                        <p className="text-xs text-gray-400 line-through mb-0.5">
                          ₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      {order.couponApplied && order.discount > 0 && (
                        <p className="text-xs font-medium text-emerald-600">
                          -₹{order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} off
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        isExpanded ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Expandable Details */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 sm:px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      {/* Customer Details */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        <HiUser className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700">{order.user?.name || 'Deleted User'}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-400">{order.user?.email || 'N/A'}</span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary-600">{item.quantity}x</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 truncate">{getShortName(item.name)}</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-4">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Price Summary */}
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-200 space-y-1.5">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {order.couponApplied && order.discount > 0 && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span className="flex items-center gap-1">
                              <HiTicket className="w-3.5 h-3.5" />
                              {order.couponApplied}
                            </span>
                            <span>-₹{order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                          <span>Total</span>
                          <span>₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
