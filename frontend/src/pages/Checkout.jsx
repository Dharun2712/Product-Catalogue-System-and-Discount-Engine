import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  HiTicket,
  HiCheck,
  HiX,
  HiExclamation,
  HiShieldCheck,
  HiLightningBolt,
  HiTruck,
  HiCurrencyRupee,
  HiShoppingBag,
  HiArrowLeft,
  HiSparkles,
} from 'react-icons/hi';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, symbol } = useCurrency();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [applying, setApplying] = useState(false);

  const total = subtotal - discount;

  const handleApplyCoupon = async (code) => {
    if (!code) return toast.error('Enter a coupon code');
    setApplying(true);
    try {
      const { data } = await API.post('/coupons/validate', {
        code,
        subtotal,
      });
      setAppliedCoupon(data.code);
      setDiscount(data.discount);
      setCouponCode(data.code);
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
      setShowCoupons(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    setShowCoupons(true);
    try {
      const { data } = await API.get(`/coupons/available?subtotal=${subtotal}`);
      setAvailableCoupons(data);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }));

      await API.post('/orders', {
        items: orderItems,
        couponCode: appliedCoupon || undefined,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-sm transition-all"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-400 mt-0.5">Review your order and place it</p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-primary-600">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">
                <HiCheck className="w-3.5 h-3.5" />
              </span>
              Cart
            </span>
            <div className="w-8 h-px bg-primary-300" />
            <span className="flex items-center gap-1.5 text-primary-600">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
              Checkout
            </span>
            <div className="w-8 h-px bg-gray-200" />
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs">3</span>
              Done
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column - Cart & Coupon */}
          <div className="lg:col-span-3 space-y-5">
            {/* Order Items Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-50 to-orange-50 rounded-lg flex items-center justify-center">
                    <HiShoppingBag className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Order Summary</h2>
                    <p className="text-xs text-gray-400">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div
                    key={item.product}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xl font-bold text-gray-200">{item.name.charAt(0)}</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400">{formatPrice(item.price)}</span>
                        <span className="text-gray-200">×</span>
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-50 text-primary-700 text-xs font-bold rounded-md">
                          {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg flex items-center justify-center">
                    <HiTicket className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Coupons & Offers</h2>
                    <p className="text-xs text-gray-400">Apply coupon to get extra savings</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                {appliedCoupon ? (
                  <div className="relative flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 border-dashed rounded-xl px-5 py-4 overflow-hidden">
                    {/* Decorative circles for coupon look */}
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-emerald-200" />
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-emerald-200" />

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                        <HiCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-800 text-sm tracking-wide">{appliedCoupon}</span>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          You save {formatPrice(discount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="w-8 h-8 rounded-lg bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                          placeholder="Enter coupon code"
                        />
                      </div>
                      <button
                        onClick={() => handleApplyCoupon(couponCode)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-primary-200 whitespace-nowrap text-sm"
                        disabled={applying}
                      >
                        {applying ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Applying
                          </span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    <button
                      onClick={fetchAvailableCoupons}
                      className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold group transition-colors"
                    >
                      <HiSparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      View available coupons
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </button>
                  </div>
                )}

                {/* Available Coupons Drawer */}
                {showCoupons && (
                  <div className="mt-5 border-2 border-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-5 py-3 flex justify-between items-center">
                      <span className="font-bold text-gray-700 text-sm">Available Coupons</span>
                      <button
                        onClick={() => setShowCoupons(false)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm transition"
                      >
                        <HiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {loadingCoupons ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-gray-400 mt-3">Finding best coupons...</p>
                      </div>
                    ) : availableCoupons.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-3xl mb-2">😔</div>
                        <p className="text-gray-500 text-sm">No coupons available right now</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                        {availableCoupons
                          .sort((a, b) => (b.eligible ? 1 : 0) - (a.eligible ? 1 : 0))
                          .map((coupon) => (
                            <div
                              key={coupon._id}
                              className={`p-4 transition-all ${
                                coupon.eligible
                                  ? 'bg-white hover:bg-primary-50/50 cursor-pointer group'
                                  : 'bg-gray-50/50 opacity-50'
                              }`}
                              onClick={() => coupon.eligible && handleApplyCoupon(coupon.code)}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg ${
                                      coupon.eligible
                                        ? 'bg-primary-50 text-primary-700 border border-primary-100 group-hover:bg-primary-100'
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {coupon.code}
                                  </span>
                                </div>
                                {coupon.eligible && (
                                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
                                    Save {formatPrice(coupon.discount)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 ml-0.5">
                                {coupon.type === 'percentage'
                                  ? `${coupon.value}% off`
                                  : `Flat ${formatPrice(coupon.value)} off`}
                                {coupon.minOrderValue > 0 && ` on orders above ${formatPrice(coupon.minOrderValue)}`}
                                {coupon.maxDiscountCap && ` (max ${formatPrice(coupon.maxDiscountCap)})`}
                              </p>
                              {!coupon.eligible && coupon.reasons.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5 ml-0.5">
                                  <HiExclamation className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                  <span className="text-xs text-amber-600">{coupon.reasons[0]}</span>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price Details & Place Order */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-5">
              {/* Price Breakdown Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                      <HiCurrencyRupee className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-gray-900">Price Details</h2>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-600 flex items-center gap-1">
                        <HiTicket className="w-3.5 h-3.5" />
                        Coupon Discount
                      </span>
                      <span className="text-sm font-semibold text-emerald-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <HiTruck className="w-3.5 h-3.5" />
                      Delivery
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      FREE
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-dashed border-gray-100 my-1" />

                  {/* Total */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900 flex items-center">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Savings Badge */}
                  {discount > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                      <p className="text-sm font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
                        <HiSparkles className="w-4 h-4" />
                        You're saving {formatPrice(discount)} on this order!
                      </p>
                    </div>
                  )}
                </div>

                {/* Place Order Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-lg rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 flex items-center justify-center gap-2"
                    disabled={placing}
                  >
                    {placing ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <HiShieldCheck className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <HiShieldCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 font-medium leading-tight">Secure Payment</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <HiTruck className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 font-medium leading-tight">Free Delivery</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <HiLightningBolt className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 font-medium leading-tight">Instant Confirm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
