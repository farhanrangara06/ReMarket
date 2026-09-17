import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { createRequest } from '../../services/requestService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getErrorMessage } from '../../utils/helpers';

const PurchaseRequestModal = ({ product, isOpen, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createRequest({
        productId: product._id,
        message,
        offeredPrice: offeredPrice || undefined,
      });
      onSuccess?.();
      onClose();
      setMessage('');
      setOfferedPrice('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Send Purchase Request</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Requesting: <span className="font-medium text-gray-900">{product.title}</span>
          <span className="text-primary-600 font-semibold ml-2">₹{product.price?.toLocaleString('en-IN')}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              maxLength={500}
              placeholder="Hi, I'm interested in this product..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offered Price (optional)</label>
            <input
              type="number"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              min="1"
              placeholder={`Listed at ₹${product.price?.toLocaleString('en-IN')}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? <LoadingSpinner size="small" /> : (
              <>
                <Send className="w-4 h-4" />
                Send Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PurchaseRequestModal;
