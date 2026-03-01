import { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  HiCurrencyRupee,
  HiUsers,
  HiClipboardList,
  HiTicket,
  HiCube,
  HiStar,
  HiTrendingUp,
  HiTrendingDown,
} from 'react-icons/hi';


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchReviewStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const { data } = await API.get('/reviews/analytics/summary');
      setReviewStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = stats
    ? [
        {
          label: 'Total Revenue',
          value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
          icon: HiCurrencyRupee,
          bgColor: 'bg-emerald-50',
          iconColor: 'text-emerald-500',
          borderColor: 'border-l-emerald-500',
        },
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: HiUsers,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-500',
          borderColor: 'border-l-blue-500',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders,
          icon: HiClipboardList,
          bgColor: 'bg-violet-50',
          iconColor: 'text-violet-500',
          borderColor: 'border-l-violet-500',
        },
        {
          label: 'Total Products',
          value: stats.totalProducts,
          icon: HiCube,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-500',
          borderColor: 'border-l-orange-500',
        },
        {
          label: 'Coupons Used',
          value: stats.totalCouponsUsed,
          icon: HiTicket,
          bgColor: 'bg-pink-50',
          iconColor: 'text-pink-500',
          borderColor: 'border-l-pink-500',
        },
        {
          label: 'Reviews',
          value: reviewStats ? `${reviewStats.totalReviews} (${reviewStats.averageRating}★)` : '...',
          icon: HiStar,
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-500',
          borderColor: 'border-l-amber-500',
        },
      ]
    : [];

  // Pie chart data for order summary
  const orderPieData = stats
    ? [
        { name: 'Revenue', value: stats.totalRevenue },
        { name: 'Orders', value: stats.totalOrders * 100 },
      ]
    : [];

  const PIE_COLORS = ['#f97316', '#fb923c', '#fdba74'];

  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl p-5 border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-2xl ${card.bgColor}`}>        
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
              <p className="text-sm text-gray-400 mt-0.5">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
              <span className="text-gray-500">Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.salesData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                fontSize={12}
                stroke="#d1d5db"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                fontSize={12}
                stroke="#d1d5db"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#f97316', strokeWidth: 2, stroke: '#fff', r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Stats</h3>
            <p className="text-sm text-gray-400 mb-6">Overview at a glance</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={orderPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {orderPieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [name === 'Revenue' ? `₹${value.toLocaleString('en-IN')}` : Math.round(value / 100), name]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-gray-500">Revenue</span>
              </div>
              <span className="font-semibold text-gray-800">₹{stats?.totalRevenue?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
                <span className="text-gray-500">Orders</span>
              </div>
              <span className="font-semibold text-gray-800">{stats?.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order Trends</h3>
            <p className="text-sm text-gray-400 mt-0.5">Daily order count over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
            <span className="text-gray-500">Orders</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats?.salesData || []} barSize={32}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              fontSize={12}
              stroke="#d1d5db"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              fontSize={12}
              stroke="#d1d5db"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [value, 'Orders']}
              labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              cursor={{ fill: '#f3f4f6', radius: 8 }}
            />
            <Bar dataKey="orders" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
