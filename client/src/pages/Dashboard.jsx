import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package, Heart, Send, Inbox, Plus, User, CheckCircle, Clock, ShoppingBag,
} from 'lucide-react';
import { getDashboardStats } from '../services/userService';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.stats);
      } catch {
        // Stats are optional enhancement
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: 'Total Listings', value: stats.totalListings, icon: Package, color: 'bg-blue-100 text-blue-600', to: '/products/mine' },
    { label: 'Available', value: stats.availableListings, icon: ShoppingBag, color: 'bg-green-100 text-green-600', to: '/products/mine' },
    { label: 'Sold', value: stats.soldListings, icon: CheckCircle, color: 'bg-gray-100 text-gray-600', to: '/products/mine' },
    { label: 'Wishlist', value: stats.wishlistCount, icon: Heart, color: 'bg-red-100 text-red-600', to: '/wishlist' },
    { label: 'Pending Sent', value: stats.pendingSentRequests, icon: Send, color: 'bg-yellow-100 text-yellow-700', to: '/requests/sent' },
    { label: 'Accepted Sent', value: stats.acceptedSentRequests, icon: CheckCircle, color: 'bg-green-100 text-green-700', to: '/requests/sent' },
    { label: 'Pending Received', value: stats.pendingReceivedRequests, icon: Clock, color: 'bg-orange-100 text-orange-700', to: '/requests/received' },
    { label: 'Accepted Received', value: stats.acceptedReceivedRequests, icon: Inbox, color: 'bg-purple-100 text-purple-700', to: '/requests/received' },
  ] : [];

  const quickLinks = [
    { to: '/sell', label: 'Sell Product', icon: Plus, color: 'bg-primary-600 text-white hover:bg-primary-700' },
    { to: '/products/mine', label: 'My Listings', icon: Package, color: 'bg-white border border-gray-200 hover:bg-gray-50' },
    { to: '/requests/sent', label: 'Sent Requests', icon: Send, color: 'bg-white border border-gray-200 hover:bg-gray-50' },
    { to: '/requests/received', label: 'Received Requests', icon: Inbox, color: 'bg-white border border-gray-200 hover:bg-gray-50' },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, color: 'bg-white border border-gray-200 hover:bg-gray-50' },
    { to: '/profile', label: 'Profile', icon: User, color: 'bg-white border border-gray-200 hover:bg-gray-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your listings, requests, and account</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-2 p-3 rounded-xl font-medium text-sm transition-colors ${link.color}`}
          >
            <link.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
