import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <ShoppingBag className="w-7 h-7 text-primary-400" />
              ReMarket
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Buy Smart. Sell Easy. Your local marketplace for quality used products.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors">Sell Product</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=Mobile Phones" className="hover:text-white transition-colors">Mobile Phones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                Mumbai, Maharashtra, India
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                support@remarket.local
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>&copy; {currentYear} ReMarket. All rights reserved.</p>
          <p>College Project — MERN Stack Practical No. 10</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
