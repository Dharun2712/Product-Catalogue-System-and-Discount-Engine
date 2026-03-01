import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { HiShoppingCart, HiEye } from 'react-icons/hi';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const { formatPrice } = useCurrency();
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="card group hover:shadow-md transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-gray-300 text-6xl font-light">
              {product.name.charAt(0)}
            </div>
          )}
        </div>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {isAdmin ? (
            <Link
              to={`/product/${product._id}`}
              className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all duration-200"
              title="Preview"
            >
              <HiEye className="w-5 h-5" />
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              disabled={product.stock === 0}
              className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
