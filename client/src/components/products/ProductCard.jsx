import { Link } from 'react-router-dom';
import { MapPin, Eye } from 'lucide-react';
import WishlistButton from './WishlistButton';

const conditionColors = {
  'Like New': 'bg-green-100 text-green-700',
  Excellent: 'bg-blue-100 text-blue-700',
  Good: 'bg-yellow-100 text-yellow-700',
  Fair: 'bg-orange-100 text-orange-700',
};

const ProductCard = ({ product }) => {
  const image = product.images?.[0] || '/placeholder-product.png';
  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to={`/products/${product._id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
        />
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${conditionColors[product.condition] || 'bg-gray-100 text-gray-700'}`}>
          {product.condition}
        </span>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <WishlistButton productId={product._id} />
          {product.status !== 'Available' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900/70 text-white">
              {product.status}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        <p className="text-xl font-bold text-primary-600 mt-1">
          ₹{product.price?.toLocaleString('en-IN')}
        </p>

        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{product.location}</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{product.seller?.name}</span>
            <span className="mx-1">·</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3.5 h-3.5" />
              {product.views || 0}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 text-center py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
