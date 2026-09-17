import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin, Eye, ArrowLeft, Tag, User, Phone, Calendar, ShoppingCart,
  Edit, Trash2, CheckCircle,
} from 'lucide-react';
import { getProduct, deleteProduct, markAsSold } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getId, getErrorMessage } from '../utils/helpers';
import WishlistButton from '../components/products/WishlistButton';
import PurchaseRequestModal from '../components/requests/PurchaseRequestModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      addToast(location.state.message, 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await getProduct(id);
        setProduct(data.product);
      } catch (err) {
        setError(getErrorMessage(err, 'Product not found'));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isOwner = getId(user) === getId(product?.seller);
  const canRequest = isAuthenticated && !isOwner && product?.status === 'Available';

  const handleRequestClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowRequestModal(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this product permanently?')) return;
    setActionLoading(true);
    try {
      await deleteProduct(id);
      addToast('Product deleted successfully', 'success');
      navigate('/products/mine');
    } catch (err) {
      addToast(getErrorMessage(err, 'Failed to delete'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Mark this product as sold?')) return;
    setActionLoading(true);
    try {
      const { data } = await markAsSold(id);
      setProduct(data.product);
      addToast('Product marked as sold', 'success');
    } catch (err) {
      addToast(getErrorMessage(err, 'Failed to update'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <Link to="/products" className="text-primary-600 hover:underline">Back to Products</Link>
      </div>
    );
  }

  const statusColors = {
    Available: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Sold: 'bg-gray-100 text-gray-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm">
            <img
              src={product.images?.[activeImage] || 'https://placehold.co/600x400?text=No+Image'}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2 ${statusColors[product.status]}`}>
                {product.status}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.title}</h1>
            </div>
            {!isOwner && <WishlistButton productId={product._id} />}
          </div>

          <p className="text-3xl font-bold text-primary-600 mt-3">
            ₹{product.price?.toLocaleString('en-IN')}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: Tag, label: product.condition },
              { label: product.category },
              { icon: MapPin, label: product.location },
              { icon: Eye, label: `${product.views} views` },
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                {badge.icon && <badge.icon className="w-3.5 h-3.5" />}
                {badge.label}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {product.brand && (
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-medium">Brand:</span> {product.brand}
            </p>
          )}

          <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Seller Information
            </h3>
            <p className="font-medium text-gray-800">{product.seller?.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {product.seller?.city}
            </p>
            {isAuthenticated && product.seller?.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5" /> {product.seller.phone}
              </p>
            )}
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
              <Calendar className="w-3.5 h-3.5" />
              Posted {new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {canRequest && (
              <button
                onClick={handleRequestClick}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                Send Purchase Request
              </button>
            )}
            {isOwner && product.status !== 'Sold' && (
              <>
                <Link
                  to={`/products/${product._id}/edit`}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" /> Edit
                </Link>
                {product.status === 'Available' && (
                  <button
                    onClick={handleMarkSold}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Sold
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
            {!isAuthenticated && product.status === 'Available' && (
              <button
                onClick={() => navigate('/login')}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700"
              >
                Login to Request
              </button>
            )}
          </div>
        </div>
      </div>

      <PurchaseRequestModal
        product={product}
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => addToast('Purchase request sent! The seller will be notified.', 'success')}
      />
    </div>
  );
};

export default ProductDetails;
