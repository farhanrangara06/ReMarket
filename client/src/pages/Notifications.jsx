import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';

const typeIcons = {
  request_received: '📩',
  request_accepted: '✅',
  request_rejected: '❌',
  request_cancelled: '🚫',
  request_completed: '🎉',
  product_sold: '🏷️',
  admin_action: '⚙️',
  general: '🔔',
};

const Notifications = () => {
  const { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead } = useNotifications();
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState('all');

  const loadNotifications = async (page = 1) => {
    const params = { page, limit: 15 };
    if (filter === 'unread') params.unread = 'true';
    const response = await fetchNotifications(params);
    if (response?.pagination) setPagination(response.pagination);
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkRead = async (id) => {
    await markRead(id);
  };

  const getNotificationLink = (notification) => {
    if (notification.relatedProduct) {
      const productId = notification.relatedProduct._id || notification.relatedProduct;
      return `/products/${productId}`;
    }
    if (notification.type?.includes('request_received')) return '/requests/received';
    if (notification.type?.includes('request')) return '/requests/sent';
    return null;
  };

  const formattedDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'unread' ? 'You have no unread notifications.' : 'You will be notified about purchase requests and updates here.'}
        />
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const content = (
                <div className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                  !notification.read
                    ? 'bg-primary-50/50 border-primary-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <span className="text-2xl shrink-0">{typeIcons[notification.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formattedDate(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleMarkRead(notification._id); }}
                      className="shrink-0 text-xs text-primary-600 hover:underline self-start"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );

              return link ? (
                <Link key={notification._id} to={link} onClick={() => !notification.read && handleMarkRead(notification._id)}>
                  {content}
                </Link>
              ) : (
                <div key={notification._id}>{content}</div>
              );
            })}
          </div>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={loadNotifications}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
