import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, LogOut, LayoutDashboard, Shield, User, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logoutUser } = useAuth();
  const { wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Browse' },
    ...(isAuthenticated ? [{ to: '/sell', label: 'Sell' }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <ShoppingBag className="w-7 h-7" />
            ReMarket
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <Link
                  to="/wishlist"
                  className="relative flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                >
                  <Heart className="w-4 h-4" />
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-sm text-gray-500 flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-600 hover:text-primary-600 py-1"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/notifications" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                  Notifications
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                  Profile
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="block text-red-600 py-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-gray-600 py-1">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-primary-600 font-medium py-1">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
