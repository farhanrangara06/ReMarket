import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess, sendPaginated } from '../utils/apiResponse.js';
import { getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationService.js';
import { formatProduct } from '../services/productService.js';

const formatNotifications = (notifications) =>
  notifications.map((n) => {
    const obj = n.toObject ? n.toObject() : { ...n };
    if (obj.relatedProduct?.images) {
      obj.relatedProduct = formatProduct(obj.relatedProduct);
    }
    return obj;
  });

export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('relatedProduct', 'title images')
      .populate('relatedRequest', 'status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    getUnreadCount(req.user._id),
  ]);

  sendPaginated(res, 'Notifications fetched successfully', formatNotifications(notifications), {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    unreadCount,
  });
});

export const getUnreadCountHandler = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  sendSuccess(res, 200, 'Unread count fetched', { unreadCount: count });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user._id);
  if (!notification) throw new AppError('Notification not found', 404);

  sendSuccess(res, 200, 'Notification marked as read', { notification });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);
  sendSuccess(res, 200, 'All notifications marked as read');
});
