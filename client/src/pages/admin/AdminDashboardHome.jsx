import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, Clock, Tags, CheckCircle, Ban } from 'lucide-react';
import { getAdminDashboard } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { getErrorMessage } from '../../utils/helpers';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getAdminDashboard();
        setStats(data.stats);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load stats'));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600', to: '/admin/users' },
    { label: 'Active Users', value: stats.activeUsers, icon: CheckCircle, color: 'bg-green-100 text-green-600', to: '/admin/users' },
    { label: 'Blocked Users', value: stats.blockedUsers, icon: Ban, color: 'bg-red-100 text-red-600', to: '/admin/users' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-100 text-purple-600', to: '/admin/products' },
    { label: 'Available Products', value: stats.availableProducts, icon: ShoppingBag, color: 'bg-green-100 text-green-700', to: '/admin/products' },
    { label: 'Sold Products', value: stats.soldProducts, icon: CheckCircle, color: 'bg-gray-100 text-gray-600', to: '/admin/products' },
    { label: 'Pending Products', value: stats.pendingProducts, icon: Clock, color: 'bg-yellow-100 text-yellow-700', to: '/admin/products' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'bg-orange-100 text-orange-700', to: '/admin/products' },
    { label: 'Categories', value: stats.totalCategories, icon: Tags, color: 'bg-indigo-100 text-indigo-600', to: '/admin/categories' },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Summary</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Total purchase requests: <strong>{stats.totalRequests}</strong></li>
          <li>Products awaiting sale: <strong>{stats.availableProducts}</strong></li>
          <li>Users currently blocked: <strong>{stats.blockedUsers}</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
