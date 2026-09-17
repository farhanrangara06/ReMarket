import mongoose from 'mongoose';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_STATUS,
  CONTACT_PREFERENCES,
} from '../utils/constants.js';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: PRODUCT_CATEGORIES,
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: PRODUCT_CONDITIONS,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    contactPreference: {
      type: String,
      enum: CONTACT_PREFERENCES,
      default: 'Both',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: 'Available',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text' });

// Filter/sort indexes
productSchema.index({ category: 1, status: 1 });
productSchema.index({ location: 1 });
productSchema.index({ price: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ condition: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
