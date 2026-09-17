import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as wishlistService from '../services/wishlistService';

export const useWishlist = () => {
  const { user, isAuthenticated, loadUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const wishlistIds = user?.wishlist?.map((id) =>
    typeof id === 'string' ? id : id._id || id.toString()
  ) || [];

  const isInWishlist = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist(productId)) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
      await loadUser();
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await wishlistService.addToWishlist(productId);
      await loadUser();
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    setLoading(true);
    try {
      await wishlistService.removeFromWishlist(productId);
      await loadUser();
    } finally {
      setLoading(false);
    }
  };

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    loading,
  };
};
