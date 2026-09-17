import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { getWishlist } from '../services/wishlistService';
import ProductCard from '../components/products/ProductCard';
import ProductCardSkeleton from '../components/products/ProductCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { getErrorMessage } from '../utils/helpers';
import { useWishlist } from '../hooks/useWishlist';

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { wishlistIds } = useWishlist();

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getWishlist();
      setProducts(data.products);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load wishlist'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Remove products from list when toggled off via heart button
  useEffect(() => {
    if (!loading) {
      setProducts((prev) => prev.filter((p) => wishlistIds.includes(p._id)));
    }
  }, [wishlistIds, loading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">
            {loading ? 'Loading...' : `${products.length} saved item${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg border border-red-200 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No wishlist items yet"
          description="Browse products and tap the heart icon to save items you like."
          action={
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
