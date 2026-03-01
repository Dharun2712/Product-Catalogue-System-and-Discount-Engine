import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { HiTrash, HiMinus, HiPlus, HiArrowRight } from 'react-icons/hi';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const { formatPrice } = useCurrency();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Continue Shopping <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.product} className="card p-4 flex items-center gap-4">
            {/* Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-2xl text-gray-300 font-light">{item.name.charAt(0)}</span>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product}`} className="font-medium text-gray-900 hover:text-primary-600 transition truncate block">
                {item.name}
              </Link>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                {item.originalPrice > item.price && (
                  <span className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => updateQuantity(item.product, item.quantity - 1)}
                className="p-1.5 hover:bg-gray-100 transition rounded-l-lg"
                disabled={item.quantity <= 1}
              >
                <HiMinus className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                className="p-1.5 hover:bg-gray-100 transition rounded-r-lg"
                disabled={item.quantity >= item.stock}
              >
                <HiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right w-24">
              <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.product)}
              className="p-2 text-gray-400 hover:text-red-500 transition"
            >
              <HiTrash className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-gray-700">Subtotal</span>
          <span className="text-2xl font-bold text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="btn-secondary flex-1 text-center">
            Continue Shopping
          </Link>
          <Link to="/checkout" className="btn-primary flex-1 text-center flex items-center justify-center gap-2">
            Proceed to Checkout <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
