import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  message,
  type = 'general',
  relatedProduct = null,
  relatedRequest = null,
}) => {
  return Notification.create({
    recipient,
    message,
    type,
    relatedProduct,
    relatedRequest,
  });
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, read: false });
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};
