import { NavLink } from 'react-router-dom';
import { HiChartBar, HiCube, HiTicket, HiUsers, HiClipboardList, HiStar } from 'react-icons/hi';

const links = [
  { to: '/admin', icon: HiChartBar, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: HiCube, label: 'Products' },
  { to: '/admin/coupons', icon: HiTicket, label: 'Coupons' },
  { to: '/admin/reviews', icon: HiStar, label: 'Reviews' },
  { to: '/admin/users', icon: HiUsers, label: 'Users' },
  { to: '/admin/orders', icon: HiClipboardList, label: 'Orders' },
];

export default function AdminNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
