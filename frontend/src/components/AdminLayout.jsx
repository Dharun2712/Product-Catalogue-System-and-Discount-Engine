import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiChartBar,
  HiCube,
  HiTicket,
  HiUsers,
  HiClipboardList,
  HiStar,
  HiCog,
  HiQuestionMarkCircle,
  HiSearch,
  HiMenu,
  HiX,
} from 'react-icons/hi';
import { useState } from 'react';

const mainLinks = [
  { to: '/admin', icon: HiChartBar, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: HiClipboardList, label: 'Orders' },
  { to: '/admin/products', icon: HiCube, label: 'Products' },
  { to: '/admin/users', icon: HiUsers, label: 'Customers' },
  { to: '/admin/reviews', icon: HiStar, label: 'Reviews' },
  { to: '/admin/coupons', icon: HiTicket, label: 'Coupons' },
];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine page title from current path
  const currentLink = mainLinks.find((l) =>
    l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)
  );
  const pageTitle = currentLink?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-2 h-2 bg-white rounded-sm" />
            <div className="w-2 h-2 bg-white rounded-sm" />
            <div className="w-2 h-2 bg-white rounded-sm" />
            <div className="w-2 h-2 bg-white rounded-sm" />
          </div>
        </div>
        <span className="text-xl font-bold text-gray-900">ShopEase</span>
      </div>

      {/* Main Nav */}
      <div className="px-3 mt-2 flex-1">
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Links */}
      <div className="px-3 pb-6 space-y-1 border-t border-gray-100 pt-4 mt-4">
        <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
          <HiQuestionMarkCircle className="w-5 h-5" />
          Store Front
        </a>
        <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
          <HiCog className="w-5 h-5" />
          Settings
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <HiMenu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden sm:flex items-center bg-gray-50 rounded-xl px-4 py-2 gap-2 w-64 border border-gray-100 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                <HiSearch className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stock, order, etc"
                  className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
                />
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
