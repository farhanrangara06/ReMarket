import mongoose from 'mongoose';
import { REQUEST_STATUS } from '../utils/constants.js';

const purchaseRequestSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    offeredPrice: {
      type: Number,
      min: [1, 'Offered price must be at least ₹1'],
      default: null,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active requests from same buyer for same product
purchaseRequestSchema.index(
  { product: 1, buyer: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Pending' },
  }
);

purchaseRequestSchema.index({ buyer: 1, status: 1 });
purchaseRequestSchema.index({ seller: 1, status: 1 });
purchaseRequestSchema.index({ product: 1 });

const PurchaseRequest = mongoose.model('PurchaseRequest', purchaseRequestSchema);

export default PurchaseRequest;
