import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { formatProducts } from '../services/productService.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    populate: { path: 'seller', select: 'name city profileImage' },
  });

  const products = user.wishlist.filter((item) => item && item._id);

  sendSuccess(res, 200, 'Wishlist fetched successfully', {
    products: formatProducts(products),
    count: products.length,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  if (product.seller.toString() === req.user._id.toString()) {
    throw new AppError('You cannot add your own product to wishlist', 400);
  }

  const user = await User.findById(req.user._id);

  const alreadyInWishlist = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (alreadyInWishlist) {
    throw new AppError('Product is already in your wishlist', 409);
  }

  user.wishlist.push(productId);
  await user.save();

  sendSuccess(res, 200, 'Product added to wishlist', {
    wishlistCount: user.wishlist.length,
    productId,
  });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  const index = user.wishlist.findIndex((id) => id.toString() === productId);

  if (index === -1) {
    throw new AppError('Product not found in wishlist', 404);
  }

  user.wishlist.splice(index, 1);
  await user.save();

  sendSuccess(res, 200, 'Product removed from wishlist', {
    wishlistCount: user.wishlist.length,
    productId,
  });
});
