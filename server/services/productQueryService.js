import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../utils/constants.js';
import AppError from '../utils/AppError.js';

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

export const buildProductFilter = (query) => {
  const filter = { status: { $ne: 'Rejected' } };

  // Default public browse shows available products
  if (query.status) {
    filter.status = query.status;
  } else if (!query.seller) {
    filter.status = 'Available';
  }

  if (query.seller) {
    filter.seller = query.seller;
  }

  if (query.category) {
    if (!PRODUCT_CATEGORIES.includes(query.category)) {
      throw new AppError('Invalid category filter', 400);
    }
    filter.category = query.category;
  }

  if (query.condition) {
    if (!PRODUCT_CONDITIONS.includes(query.condition)) {
      throw new AppError('Invalid condition filter', 400);
    }
    filter.condition = query.condition;
  }

  if (query.location) {
    filter.location = new RegExp(query.location, 'i');
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) {
      const min = Number(query.minPrice);
      if (isNaN(min) || min < 0) throw new AppError('Invalid minPrice', 400);
      filter.price.$gte = min;
    }
    if (query.maxPrice) {
      const max = Number(query.maxPrice);
      if (isNaN(max) || max < 0) throw new AppError('Invalid maxPrice', 400);
      filter.price.$lte = max;
    }
  }

  if (query.search?.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
      { location: searchRegex },
    ];
  }

  return filter;
};

export const buildProductSort = (sortKey) => {
  return SORT_OPTIONS[sortKey] || SORT_OPTIONS.newest;
};
