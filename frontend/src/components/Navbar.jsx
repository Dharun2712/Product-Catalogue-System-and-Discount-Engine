import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { HiShoppingCart, HiUser, HiLogout, HiCog, HiMenu, HiX, HiGlobeAlt } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { currency, setCurrency, currencies, symbols } = useCurrency();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef(null);

  // Close currency dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) setCurrencyOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

            {/* Currency Selector */}
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-all border border-gray-200 hover:border-primary-200"
              >
                <HiGlobeAlt className="w-4 h-4" />
                <span className="font-semibold">{symbols[currency]}</span>
                <span>{currency}</span>
                <svg className={`w-3 h-3 ml-0.5 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        c === currency
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-6 text-center font-bold text-base">{symbols[c]}</span>
                      <span>{c}</span>
                      {c === currency && (
                        <svg className="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
          {/* Mobile Currency Selector */}
          <div className="flex items-center gap-2 py-2">
            <HiGlobeAlt className="w-4 h-4 text-gray-500" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary-500"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>{symbols[c]} {c}</option>
              ))}
            </select>
          </div>
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
