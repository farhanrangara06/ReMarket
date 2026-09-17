import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import { getAdminProducts, deleteAdminProduct } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { getErrorMessage } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';
import { PRODUCT_STATUS } from '../../utils/constants';

const statusColors = {
  Available: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Sold: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-700',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data, pagination: pag } = await getAdminProducts(params);
      setProducts(data);
      setPagination(pag);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleRemove = async (id, title) => {
    if (!window.confirm(`Remove "${title}" from platform?`)) return;
    setActionLoading(true);
    try {
      await deleteAdminProduct(id);
      fetchProducts(pagination.page);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove product'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Management</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          {PRODUCT_STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" />
      ) : (
        <>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                <img
                  src={product.images?.[0] || 'https://placehold.co/80x80?text=No+Image'}
                  alt={product.title}
                  className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                      <p className="text-sm text-primary-600 font-semibold">₹{product.price?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.seller?.name} · {product.location} · {product.category}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </Link>
                    {product.status !== 'Rejected' && (
                      <button
                        onClick={() => handleRemove(product._id, product.title)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
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

export default AdminProducts;
