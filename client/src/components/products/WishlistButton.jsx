import { Heart } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { getErrorMessage } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const WishlistButton = ({ productId, className = '' }) => {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const { addToast } = useToast();
  const inWishlist = isInWishlist(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist(productId);
      addToast(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        'success',
        2000
      );
    } catch (err) {
      addToast(getErrorMessage(err, 'Failed to update wishlist'), 'error');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors disabled:opacity-50 ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
        }`}
      />
    </button>
  );
};

export default WishlistButton;
