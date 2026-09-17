import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { validatePositiveNumber } from '../utils/validators.js';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, CONTACT_PREFERENCES } from '../utils/constants.js';
import { formatProduct, formatProducts, deleteProductImages } from '../services/productService.js';
import { imagesMatch } from '../services/imageService.js';
import { buildProductFilter, buildProductSort } from '../services/productQueryService.js';

const checkOwnership = (product, user) => {
  if (product.seller.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new AppError('You are not authorized to modify this product', 403);
  }
};

const validateProductFields = (body, requireImages = false, files = []) => {
  const { title, description, category, price, condition, location } = body;

  if (!title?.trim()) throw new AppError('Product name is required', 400);
  if (!description?.trim()) throw new AppError('Description is required', 400);
  if (!category) throw new AppError('Category is required', 400);
  if (!PRODUCT_CATEGORIES.includes(category)) throw new AppError('Invalid category', 400);
  if (!condition) throw new AppError('Condition is required', 400);
  if (!PRODUCT_CONDITIONS.includes(condition)) throw new AppError('Invalid condition', 400);
  if (!location?.trim()) throw new AppError('Location is required', 400);

  const parsedPrice = validatePositiveNumber(price, 'Price');

  if (body.contactPreference && !CONTACT_PREFERENCES.includes(body.contactPreference)) {
    throw new AppError('Invalid contact preference', 400);
  }

  if (requireImages && (!files || files.length === 0)) {
    throw new AppError('At least one product image is required', 400);
  }

  return {
    title: title.trim(),
    description: description.trim(),
    category,
    subcategory: body.subcategory?.trim() || '',
    price: parsedPrice,
    condition,
    brand: body.brand?.trim() || '',
    location: location.trim(),
    contactPreference: body.contactPreference || 'Both',
  };
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter = buildProductFilter(req.query);
  const sort = buildProductSort(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name city profileImage')
      .sort(sort)
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

export const getMyProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const filter = { seller: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('seller', 'name city profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, 'Your products fetched successfully', formatProducts(products), {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'seller',
    'name email phone city profileImage createdAt'
  );

  if (!product) throw new AppError('Product not found', 404);

  product.views += 1;
  await product.save({ validateBeforeSave: false });

  sendSuccess(res, 200, 'Product fetched successfully', {
    product: formatProduct(product),
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const validated = validateProductFields(req.body, true, req.files);

  const images = req.uploadedImages || [];

  const product = await Product.create({
    ...validated,
    images,
    seller: req.user._id,
    status: 'Available',
  });

  await product.populate('seller', 'name city profileImage');

  sendSuccess(res, 201, 'Product created successfully', {
    product: formatProduct(product),
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  checkOwnership(product, req.user);

  if (product.status === 'Sold') {
    throw new AppError('Cannot edit a sold product', 400);
  }

  const validated = validateProductFields(req.body, false, req.files);

  const newImages = req.uploadedImages || [];

  let keepImages = product.images;
  if (req.body.keepImages) {
    try {
      const parsed = typeof req.body.keepImages === 'string'
        ? JSON.parse(req.body.keepImages)
        : req.body.keepImages;
      keepImages = product.images.filter((stored) =>
        parsed.some((ref) => imagesMatch(stored, ref))
      );
    } catch {
      throw new AppError('Invalid keepImages format', 400);
    }
  }

  const finalImages = [...keepImages, ...newImages];
  const removedImages = product.images.filter(
    (stored) => !finalImages.some((final) => imagesMatch(stored, final))
  );
  await deleteProductImages(removedImages);

  if (finalImages.length === 0) {
    throw new AppError('At least one product image is required', 400);
  }

  Object.assign(product, validated, { images: finalImages });
  await product.save();
  await product.populate('seller', 'name city profileImage');

  sendSuccess(res, 200, 'Product updated successfully', {
    product: formatProduct(product),
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  checkOwnership(product, req.user);

  await deleteProductImages(product.images);
  await product.deleteOne();

  sendSuccess(res, 200, 'Product deleted successfully');
});

export const markAsSold = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  checkOwnership(product, req.user);

  if (product.status === 'Sold') {
    throw new AppError('Product is already marked as sold', 400);
  }

  product.status = 'Sold';
  await product.save();
  await product.populate('seller', 'name city profileImage');

  sendSuccess(res, 200, 'Product marked as sold', {
    product: formatProduct(product),
  });
});

