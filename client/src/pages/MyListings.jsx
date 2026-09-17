import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { getMyProducts, deleteProduct, markAsSold } from '../services/productService';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import { PRODUCT_STATUS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';

const statusColors = {
  Available: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Sold: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-700',
};

const MyListings = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page };
      if (statusFilter) params.status = statusFilter;
      const { data, pagination: pag } = await getMyProducts(params);
      setProducts(data);
      setPagination(pag);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load listings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await deleteProduct(id);
      fetchProducts(pagination.page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete product'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async (id) => {
    if (!window.confirm('Mark this product as sold?')) return;
    setActionLoading(true);
    try {
      await markAsSold(id);
      fetchProducts(pagination.page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark as sold'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 text-sm">Manage your products for sale</p>
          </div>
        </div>
        <Link
          to="/sell"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Sell New
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            !statusFilter ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          All
        </button>
        {PRODUCT_STATUS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200 mb-4">{error}</div>
      )}

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings yet"
          description="Start selling by listing your first product."
          action={
            <Link to="/sell" className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
              Sell Your First Product
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <Link to={`/products/${product._id}`} className="shrink-0">
                  <img
                    src={product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                    alt={product.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-gray-100"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                        {product.title}
                      </Link>
                      <p className="text-lg font-bold text-primary-600">₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{product.category} · {product.location} · {product.views} views</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {product.status !== 'Sold' && (
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    )}
                    {product.status === 'Available' && (
                      <button
                        onClick={() => handleMarkSold(product._id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Sold
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      disabled={actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={fetchProducts}
          />
        </>
      )}
    </div>
  );
};

export default MyListings;
