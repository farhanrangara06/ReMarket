import User from '../models/User.js';
import Product from '../models/Product.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { isValidPhone, validatePassword } from '../utils/validators.js';
import { resolveImageUrl, deleteImage } from '../services/imageService.js';

const formatUserResponse = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  userObj.profileImage = resolveImageUrl(userObj.profileImage, 'profiles');
  return userObj;
};

export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched successfully', {
    user: formatUserResponse(req.user),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, city } = req.body;
  const user = await User.findById(req.user._id);

  if (name?.trim()) user.name = name.trim();
  if (phone?.trim()) {
    if (!isValidPhone(phone)) throw new AppError('Please provide a valid 10-digit phone number', 400);
    user.phone = phone.replace(/\s/g, '');
  }
  if (city?.trim()) user.city = city.trim();

  if (req.uploadedFile) {
    if (user.profileImage) await deleteImage(user.profileImage, 'profiles');
    user.profileImage = req.uploadedFile;
  }

  await user.save();

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: formatUserResponse(user),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) throw new AppError('Current password is required', 400);
  if (!newPassword) throw new AppError('New password is required', 400);
  validatePassword(newPassword);
  if (newPassword !== confirmPassword) throw new AppError('Passwords do not match', 400);

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    totalListings,
    availableListings,
    soldListings,
    pendingSentRequests,
    acceptedSentRequests,
    pendingReceivedRequests,
    acceptedReceivedRequests,
    user,
  ] = await Promise.all([
    Product.countDocuments({ seller: userId }),
    Product.countDocuments({ seller: userId, status: 'Available' }),
    Product.countDocuments({ seller: userId, status: 'Sold' }),
    PurchaseRequest.countDocuments({ buyer: userId, status: 'Pending' }),
    PurchaseRequest.countDocuments({ buyer: userId, status: 'Accepted' }),
    PurchaseRequest.countDocuments({ seller: userId, status: 'Pending' }),
    PurchaseRequest.countDocuments({ seller: userId, status: 'Accepted' }),
    User.findById(userId).select('wishlist'),
  ]);

  sendSuccess(res, 200, 'Dashboard stats fetched', {
    stats: {
      totalListings,
      availableListings,
      soldListings,
      pendingSentRequests,
      acceptedSentRequests,
      pendingReceivedRequests,
      acceptedReceivedRequests,
      wishlistCount: user?.wishlist?.length || 0,
    },
  });
});
