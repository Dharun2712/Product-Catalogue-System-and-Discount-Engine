import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { HiShoppingCart, HiUser, HiLogout, HiCog, HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SE</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopEase</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
              Home
            </Link>

            {user ? (
              <>
                {!isAdmin && (
                  <Link to="/orders" className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                    My Orders
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                    <HiCog className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}

                {!isAdmin && (
                  <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-50">
                    <HiShoppingCart className="w-6 h-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <HiUser className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Logout"
                  >
                    <HiLogout className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/admin-login" className="text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  <HiCog className="w-4 h-4" /> Admin
                </Link>
                <Link to="/login" className="btn-secondary text-sm">Log In</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Home</Link>
          {user ? (
            <>
              {!isAdmin && (
                <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>My Orders</Link>
              )}
              {!isAdmin && (
                <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>
                  Cart {totalItems > 0 && `(${totalItems})`}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 text-red-500 w-full text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/admin-login" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Admin</Link>
              <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Log In</Link>
              <Link to="/register" className="block py-2 text-primary-600 font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
