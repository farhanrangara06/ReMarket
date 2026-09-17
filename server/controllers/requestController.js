import PurchaseRequest from '../models/PurchaseRequest.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { createNotification } from '../services/notificationService.js';
import { formatProduct } from '../services/productService.js';

const populateOptions = {
  sent: [
    { path: 'product', populate: { path: 'seller', select: 'name city profileImage' } },
    { path: 'seller', select: 'name city phone email' },
  ],
  received: [
    { path: 'product', populate: { path: 'seller', select: 'name city profileImage' } },
    { path: 'buyer', select: 'name city phone email profileImage' },
  ],
};

const formatRequest = (request) => {
  const r = request.toObject ? request.toObject() : { ...request };
  if (r.product?.images) {
    r.product = formatProduct(r.product);
  }
  if (r.buyer?.profileImage && !r.buyer.profileImage.startsWith('http')) {
    r.buyer.profileImage = `/uploads/profiles/${r.buyer.profileImage}`;
  }
  return r;
};

export const createRequest = asyncHandler(async (req, res) => {
  const { productId, message, offeredPrice } = req.body;

  if (!productId) throw new AppError('Product ID is required', 400);
  if (!message?.trim()) throw new AppError('Message is required', 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  if (product.seller.toString() === req.user._id.toString()) {
    throw new AppError('You cannot send a purchase request for your own product', 400);
  }

  if (!['Available'].includes(product.status)) {
    throw new AppError(`Cannot send request for a ${product.status.toLowerCase()} product`, 400);
  }

  const existingPending = await PurchaseRequest.findOne({
    product: productId,
    buyer: req.user._id,
    status: 'Pending',
  });

  if (existingPending) {
    throw new AppError('You already have a pending request for this product', 409);
  }

  const requestData = {
    product: productId,
    buyer: req.user._id,
    seller: product.seller,
    message: message.trim(),
    status: 'Pending',
  };

  if (offeredPrice) {
    const price = Number(offeredPrice);
    if (isNaN(price) || price <= 0) throw new AppError('Invalid offered price', 400);
    requestData.offeredPrice = price;
  }

  const request = await PurchaseRequest.create(requestData);
  await request.populate(populateOptions.sent);

  await createNotification({
    recipient: product.seller,
    message: `${req.user.name} sent a purchase request for "${product.title}"`,
    type: 'request_received',
    relatedProduct: product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 201, 'Purchase request sent successfully', {
    request: formatRequest(request),
  });
});

export const getSentRequests = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { buyer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [requests, total] = await Promise.all([
    PurchaseRequest.find(filter)
      .populate(populateOptions.sent)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PurchaseRequest.countDocuments(filter),
  ]);

  sendPaginated(res, 'Sent requests fetched successfully', requests.map(formatRequest), {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const getReceivedRequests = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { seller: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [requests, total] = await Promise.all([
    PurchaseRequest.find(filter)
      .populate(populateOptions.received)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PurchaseRequest.countDocuments(filter),
  ]);

  sendPaginated(res, 'Received requests fetched successfully', requests.map(formatRequest), {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate('product');
  if (!request) throw new AppError('Request not found', 404);

  if (request.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Only the seller can accept this request', 403);
  }

  if (request.status !== 'Pending') {
    throw new AppError(`Cannot accept a ${request.status.toLowerCase()} request`, 400);
  }

  request.status = 'Accepted';
  await request.save();

  // Update product status to Pending
  await Product.findByIdAndUpdate(request.product._id, { status: 'Pending' });

  // Reject other pending requests for the same product
  await PurchaseRequest.updateMany(
    {
      product: request.product._id,
      _id: { $ne: request._id },
      status: 'Pending',
    },
    { status: 'Rejected' }
  );

  await request.populate(populateOptions.received);

  await createNotification({
    recipient: request.buyer,
    message: `Your purchase request for "${request.product.title}" was accepted!`,
    type: 'request_accepted',
    relatedProduct: request.product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 200, 'Request accepted successfully', {
    request: formatRequest(request),
  });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate('product');
  if (!request) throw new AppError('Request not found', 404);

  if (request.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Only the seller can reject this request', 403);
  }

  if (request.status !== 'Pending') {
    throw new AppError(`Cannot reject a ${request.status.toLowerCase()} request`, 400);
  }

  request.status = 'Rejected';
  await request.save();
  await request.populate(populateOptions.received);

  await createNotification({
    recipient: request.buyer,
    message: `Your purchase request for "${request.product.title}" was rejected.`,
    type: 'request_rejected',
    relatedProduct: request.product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 200, 'Request rejected successfully', {
    request: formatRequest(request),
  });
});

export const cancelRequest = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate('product');
  if (!request) throw new AppError('Request not found', 404);

  if (request.buyer.toString() !== req.user._id.toString()) {
    throw new AppError('Only the buyer can cancel this request', 403);
  }

  if (request.status !== 'Pending') {
    throw new AppError(`Cannot cancel a ${request.status.toLowerCase()} request`, 400);
  }

  request.status = 'Cancelled';
  await request.save();
  await request.populate(populateOptions.sent);

  await createNotification({
    recipient: request.seller,
    message: `${req.user.name} cancelled their purchase request for "${request.product.title}"`,
    type: 'request_cancelled',
    relatedProduct: request.product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 200, 'Request cancelled successfully', {
    request: formatRequest(request),
  });
});

export const completeRequest = asyncHandler(async (req, res) => {
  const request = await PurchaseRequest.findById(req.params.id).populate('product');
  if (!request) throw new AppError('Request not found', 404);

  if (request.seller.toString() !== req.user._id.toString()) {
    throw new AppError('Only the seller can complete this request', 403);
  }

  if (request.status !== 'Accepted') {
    throw new AppError('Only accepted requests can be marked as completed', 400);
  }

  request.status = 'Completed';
  await request.save();

  await Product.findByIdAndUpdate(request.product._id, { status: 'Sold' });

  await request.populate(populateOptions.received);

  await createNotification({
    recipient: request.buyer,
    message: `Transaction completed for "${request.product.title}". Product is now sold.`,
    type: 'request_completed',
    relatedProduct: request.product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 200, 'Request marked as completed', {
    request: formatRequest(request),
  });
});
