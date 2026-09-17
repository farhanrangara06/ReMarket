import { Link } from 'react-router-dom';
import { MapPin, Clock, User } from 'lucide-react';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  Completed: 'bg-blue-100 text-blue-800',
};

const RequestCard = ({ request, type, onAccept, onReject, onCancel, onComplete, actionLoading }) => {
  const product = request.product;
  const image = product?.images?.[0];
  const otherUser = type === 'sent' ? request.seller : request.buyer;
  const formattedDate = new Date(request.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex gap-4">
        <Link to={`/products/${product?._id}`} className="shrink-0">
          <img
            src={image || 'https://placehold.co/100x100?text=No+Image'}
            alt={product?.title}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-gray-100"
            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/products/${product?._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                {product?.title}
              </Link>
              <p className="text-lg font-bold text-primary-600 mt-0.5">
                ₹{product?.price?.toLocaleString('en-IN')}
                {request.offeredPrice && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    Offer: ₹{request.offeredPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </p>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
              {request.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.message}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {type === 'sent' ? `Seller: ${otherUser?.name}` : `Buyer: ${otherUser?.name}`}
            </span>
            {product?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {product.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {type === 'received' && request.status === 'Pending' && (
              <>
                <button
                  onClick={() => onAccept(request._id)}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject(request._id)}
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
            {type === 'received' && request.status === 'Accepted' && (
              <button
                onClick={() => onComplete(request._id)}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Mark Completed
              </button>
            )}
            {type === 'sent' && request.status === 'Pending' && (
              <button
                onClick={() => onCancel(request._id)}
                disabled={actionLoading}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
