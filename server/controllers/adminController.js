import User from '../models/User.js';
import Product from '../models/Product.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { formatProducts, deleteProductImages } from '../services/productService.js';
import { createNotification } from '../services/notificationService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalProducts,
    availableProducts,
    soldProducts,
    pendingProducts,
    totalRequests,
    pendingRequests,
    totalCategories,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'user', isActive: false }),
    Product.countDocuments(),
    Product.countDocuments({ status: 'Available' }),
    Product.countDocuments({ status: 'Sold' }),
    Product.countDocuments({ status: 'Pending' }),
    PurchaseRequest.countDocuments(),
    PurchaseRequest.countDocuments({ status: 'Pending' }),
    Category.countDocuments({ isActive: true }),
  ]);

  sendSuccess(res, 200, 'Admin dashboard stats fetched', {
    stats: {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalProducts,
      availableProducts,
      soldProducts,
      pendingProducts,
      totalRequests,
      pendingRequests,
      totalCategories,
    },
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'blocked') filter.isActive = false;
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }, { city: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const formatted = users.map((u) => {
    const obj = u.toObject();
    if (obj.profileImage && !obj.profileImage.startsWith('http')) {
      obj.profileImage = `/uploads/profiles/${obj.profileImage}`;
    }
    return obj;
  });

  sendPaginated(res, 'Users fetched successfully', formatted, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Cannot modify admin account status', 403);
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('Cannot modify your own account status', 400);
  }

  user.isActive = isActive;
  await user.save();

  await createNotification({
    recipient: user._id,
    message: isActive
      ? 'Your account has been unblocked by admin.'
      : 'Your account has been blocked by admin. Contact support for help.',
    type: 'admin_action',
  });

  sendSuccess(res, 200, `User ${isActive ? 'unblocked' : 'blocked'} successfully`, {
    user: { _id: user._id, name: user.name, email: user.email, isActive: user.isActive },
  });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ title: regex }, { category: regex }, { location: regex }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name email city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, 'Products fetched successfully', formatProducts(products), {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const deleteAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  await deleteProductImages(product.images);

  if (product.seller) {
    await createNotification({
      recipient: product.seller,
      message: `Your product "${product.title}" was removed by admin for policy violation.`,
      type: 'admin_action',
      relatedProduct: product._id,
    });
  }

  product.status = 'Rejected';
  await product.save();

  sendSuccess(res, 200, 'Product removed successfully');
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  sendSuccess(res, 200, 'Categories fetched successfully', { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, subcategories } = req.body;
  if (!name?.trim()) throw new AppError('Category name is required', 400);

  const category = await Category.create({
    name: name.trim(),
    subcategories: subcategories || [],
  });

  sendSuccess(res, 201, 'Category created successfully', { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  if (req.body.name) category.name = req.body.name.trim();
  if (req.body.subcategories) category.subcategories = req.body.subcategories;
  if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

  await category.save();
  sendSuccess(res, 200, 'Category updated successfully', { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  category.isActive = false;
  await category.save();

  sendSuccess(res, 200, 'Category deactivated successfully');
});
